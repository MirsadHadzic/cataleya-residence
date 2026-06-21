// components/apartments/AvailabilityCalendar.tsx
// Pure client-side calendar. No external library needed.
// Receives booked date ranges as ISO strings and renders two months.

'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface BookedRange {
  checkIn: string  // ISO date string
  checkOut: string // ISO date string
}

interface Props {
  bookedRanges: BookedRange[]
}

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// Returns YYYY-MM-DD for a Date (local time, no timezone shift)
function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Build a Set of all booked date keys from ranges
function buildBookedSet(ranges: BookedRange[]): Set<string> {
  const set = new Set<string>()
  for (const { checkIn, checkOut } of ranges) {
    const start = new Date(checkIn + 'T00:00:00')
    const end   = new Date(checkOut + 'T00:00:00')
    const cur = new Date(start)
    // Mark every date in [checkIn, checkOut) as booked
    while (cur < end) {
      set.add(toDateKey(cur))
      cur.setDate(cur.getDate() + 1)
    }
  }
  return set
}

// Get all calendar day cells for a given year/month (including padding)
function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1)
  // Monday = 0 offset
  const startOffset = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

function MonthGrid({
  year,
  month,
  bookedSet,
  today,
}: {
  year: number
  month: number
  bookedSet: Set<string>
  today: string
}) {
  const cells = getCalendarDays(year, month)

  return (
    <div>
      {/* Month label */}
      <p className="text-xs font-sans font-500 tracking-widest uppercase text-charcoal mb-3 text-center">
        {MONTHS[month]} {year}
      </p>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-sans text-taupe/60 py-1 font-light"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-px">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} />
          }

          const key = toDateKey(date)
          const isBooked = bookedSet.has(key)
          const isPast = key < today

          return (
            <div
              key={key}
              className={[
                'relative flex items-center justify-center h-8 text-xs font-sans select-none',
                isPast || isBooked
                  ? 'cursor-not-allowed'
                  : 'cursor-default',
                isPast
                  ? 'text-taupe/25'
                  : isBooked
                  ? 'text-taupe/40'
                  : 'text-charcoal',
              ].join(' ')}
            >
              {/* Booked: striped muted background */}
              {isBooked && !isPast && (
                <span className="absolute inset-0.5 bg-charcoal/6 border border-charcoal/8" />
              )}
              <span className={[
                'relative',
                isBooked && !isPast ? 'line-through decoration-taupe/40' : '',
              ].join(' ')}>
                {date.getDate()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AvailabilityCalendar({ bookedRanges }: Props) {
  const today = new Date()
  const todayKey = toDateKey(today)

  const [offset, setOffset] = useState(0) // 0 = this month + next, 1 = +2/+3 months, etc.

  const bookedSet = useMemo(() => buildBookedSet(bookedRanges), [bookedRanges])

  // Two months to display
  const months = [0, 1].map((i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + offset * 2 + i, 1)
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-2xl text-charcoal">Availability</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setOffset((o) => Math.max(0, o - 1))}
            disabled={offset === 0}
            className="p-1.5 text-taupe hover:text-charcoal disabled:opacity-30 transition-colors"
            aria-label="Previous months"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="p-1.5 text-taupe hover:text-charcoal transition-colors"
            aria-label="Next months"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Two month grids */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            bookedSet={bookedSet}
            today={todayKey}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-5 pt-4 border-t border-champagne">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-charcoal/8 border border-charcoal/10 inline-block" />
          <span className="text-xs font-sans font-light text-taupe">Unavailable</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-ivory-warm border border-champagne-dark inline-block" />
          <span className="text-xs font-sans font-light text-taupe">Available</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-xs font-sans font-light leading-relaxed" style={{ color: '#8A7F70' }}>
        Availability shown is indicative. Final confirmation is provided after your booking request is reviewed.
      </p>
    </div>
  )
}
