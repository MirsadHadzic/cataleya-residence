// components/apartments/ApartmentGallery.tsx
'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import { Images } from 'lucide-react'

interface Props {
  images: string[]
  name: string
}

export function ApartmentGallery({ images, name }: Props) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const openAt = useCallback((i: number) => {
    setIndex(i)
    setOpen(true)
  }, [])

  const slides = images.map((src) => ({ src }))

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-champagne flex items-center justify-center mt-20 md:mt-24">
        <span className="text-taupe text-sm font-sans">No images available</span>
      </div>
    )
  }

  const main = images[0]
  const thumbs = images.slice(1, 5)
  const remaining = images.length - 5

  return (
    <>
      <div className="mt-20 md:mt-24">
        {images.length === 1 ? (
          // Single image -- full width, clickable
          <div
            className="relative w-full h-[50vw] min-h-[320px] max-h-[600px] cursor-pointer group"
            onClick={() => openAt(0)}
          >
            <Image src={main} alt={name} fill priority className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            <ViewAllButton total={1} onClick={() => openAt(0)} />
          </div>
        ) : (
          // Grid: large main + thumbnails
          <div className="grid gap-1" style={{ gridTemplateColumns: '2fr 1fr', gridTemplateRows: 'repeat(2, 200px)', maxHeight: '420px' }}>
            {/* Main image */}
            <div
              className="relative overflow-hidden cursor-pointer group"
              style={{ gridRow: '1 / 3' }}
              onClick={() => openAt(0)}
            >
              <Image
                src={main}
                alt={`${name} -- main view`}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Thumbnails */}
            {thumbs.map((img, i) => {
              const isLast = i === thumbs.length - 1 && remaining > 0
              return (
                <div
                  key={img}
                  className="relative overflow-hidden cursor-pointer group"
                  onClick={() => openAt(i + 1)}
                >
                  <Image
                    src={img}
                    alt={`${name} -- view ${i + 2}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="20vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  {/* +X overlay on last thumbnail */}
                  {isLast && (
                    <div
                      className="absolute inset-0 bg-black/50 flex items-center justify-center"
                      onClick={(e) => { e.stopPropagation(); openAt(i + 1) }}
                    >
                      <span className="text-white font-serif text-lg">+{remaining + 1}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* "View all photos" button below grid */}
        {images.length > 1 && (
          <button
            onClick={() => openAt(0)}
            className="mt-3 flex items-center gap-2 text-xs font-sans tracking-widest uppercase text-taupe hover:text-gold transition-colors duration-300"
          >
            <Images size={14} strokeWidth={1.5} />
            View all {images.length} photos
          </button>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={slides}
        plugins={[Zoom, Slideshow, Thumbnails]}
        styles={{
          container: { backgroundColor: 'rgba(0,0,0,0.95)' },
        }}
        carousel={{ finite: false }}
        zoom={{ maxZoomPixelRatio: 3 }}
        thumbnails={{ position: 'bottom', width: 80, height: 60, border: 1, borderRadius: 0, padding: 2, gap: 4 }}
      />
    </>
  )
}

// Small overlay button on single-image hero
function ViewAllButton({ total, onClick }: { total: number; onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 text-charcoal text-xs font-sans tracking-widest uppercase hover:bg-white transition-colors duration-300"
    >
      <Images size={13} strokeWidth={1.5} />
      View all photos
    </button>
  )
}
