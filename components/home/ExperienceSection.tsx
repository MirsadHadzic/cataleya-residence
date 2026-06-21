// components/home/ExperienceSection.tsx
import Image from 'next/image'

const pillars = [
  {
    number: '01',
    title: 'Close to the airport',
    description:
      'Sarajevo International Airport is 5 minutes away by car. Ideal for business trips, layovers, or early morning flights.',
  },
  {
    number: '02',
    title: 'Everything you need',
    description:
      'Free private parking, fast Wi-Fi, fully equipped kitchen, and a grocery store right in the building.',
  },
  {
    number: '03',
    title: 'Quiet and comfortable',
    description:
      'Located in a calm residential area. Spacious apartments for up to 8 guests, with separate bedrooms and living areas.',
  },
]

export function ExperienceSection() {
  return (
    <section id="experience" className="section-padding bg-champagne/40">
      <div className="container-content">
        {/* Editorial layout: image left, text right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center mb-24">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="/images/apartments/cataleya-1/livingroom0.jpg"
                alt="Inside a Cataleya Residence apartment"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -right-6 bg-charcoal px-8 py-6 hidden md:block">
              <div className="font-serif text-3xl text-white mb-1">2024</div>
              <div className="text-white/40 text-xs tracking-widest uppercase font-sans">Est. Sarajevo</div>
            </div>
          </div>

          {/* Text */}
          <div>
            <span className="label-text block mb-5">Why guests choose Cataleya</span>
            <h2 className="heading-xl text-charcoal mb-8">
              A practical choice
              <br />
              <em className="text-gold">in a great location</em>
            </h2>
            <div className="space-y-4 text-taupe font-light leading-relaxed">
              {[
                '5 minutes from Sarajevo International Airport',
                'Free private parking on-site',
                'Grocery store in the building',
                'Spacious apartments for up to 8 guests',
                'Quiet, safe residential neighborhood',
              ].map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 h-px w-12 bg-gold" />
          </div>
        </div>

        {/* Three pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16 pt-12 border-t border-champagne-dark">
          {pillars.map((pillar) => (
            <div key={pillar.number}>
              <div className="font-serif text-5xl text-gold/20 mb-4">{pillar.number}</div>
              <h3 className="font-serif text-xl text-charcoal mb-4">{pillar.title}</h3>
              <p className="text-taupe text-sm font-light leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
