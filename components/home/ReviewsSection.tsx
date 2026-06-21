// components/home/ReviewsSection.tsx
// Reviews are static -- no Review model in the current schema.

import { Star } from 'lucide-react'

const REVIEWS = [
  {
    id: '1',
    guestName: 'Markus T.',
    guestCountry: 'Germany',
    rating: 5,
    comment:
      'Great location, very clean apartment and easy check-in. Close to the airport and perfect for short stays.',
  },
  {
    id: '2',
    guestName: 'Sarah L.',
    guestCountry: 'United Kingdom',
    rating: 5,
    comment:
      'Spacious and comfortable. Having a grocery store in the building was very convenient. Would book again.',
  },
  {
    id: '3',
    guestName: 'Faris K.',
    guestCountry: 'Sweden',
    rating: 5,
    comment:
      'Quiet neighborhood, free parking included, and everything was exactly as described. No surprises.',
  },
  {
    id: '4',
    guestName: 'Marie D.',
    guestCountry: 'France',
    rating: 5,
    comment:
      'We stayed for a week for work. The kitchen is well equipped, the Wi-Fi is fast, and the beds are comfortable.',
  },
]

export function ReviewsSection() {
  return (
    <section id="reviews" className="section-padding bg-ivory-warm">
      <div className="container-content">
        <div className="text-center mb-16">
          <span className="label-text block mb-4">Verified guest reviews</span>
          <h2 className="heading-xl text-charcoal mb-4">What guests say</h2>
          <div className="flex items-center justify-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={16} className="fill-gold text-gold" />
            ))}
            <span className="ml-2 text-taupe text-sm font-sans font-light">
              5.0 -- Exceptional &middot; 24 reviews
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {REVIEWS.map((review, i) => (
            <div
              key={review.id}
              className={`p-8 md:p-10 transition-shadow duration-300 hover:shadow-luxury ${
                i === 0 ? 'bg-charcoal' : 'bg-white border border-champagne'
              }`}
            >
              <div className="flex gap-1 mb-6">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={12} className="fill-gold text-gold" />
                ))}
              </div>

              <blockquote
                className={`font-serif text-lg leading-relaxed mb-8 ${
                  i === 0 ? 'text-white/90' : 'text-charcoal'
                }`}
              >
                "{review.comment}"
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gold/20 flex items-center justify-center font-serif text-gold text-sm">
                  {review.guestName.charAt(0)}
                </div>
                <div>
                  <div
                    className={`font-sans font-500 text-sm ${
                      i === 0 ? 'text-white' : 'text-charcoal'
                    }`}
                  >
                    {review.guestName}
                  </div>
                  <div
                    className={`text-xs font-light ${
                      i === 0 ? 'text-white/40' : 'text-taupe'
                    }`}
                  >
                    {review.guestCountry}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
