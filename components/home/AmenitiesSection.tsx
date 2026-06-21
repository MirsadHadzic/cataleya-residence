// components/home/AmenitiesSection.tsx
import {
  Wifi, Wind, ChefHat, Car, ShieldCheck,
  Bath, Clock, MapPin, ShoppingBag, BedDouble, Lock, Tv
} from 'lucide-react'

const amenities = [
  { icon: Car,          label: 'Free private parking' },
  { icon: Wifi,         label: 'Fast Wi-Fi' },
  { icon: ShoppingBag,  label: 'Grocery store in building' },
  { icon: ChefHat,      label: 'Fully equipped kitchen' },
  { icon: BedDouble,    label: 'Comfortable beds' },
  { icon: Bath,         label: 'Private bathroom' },
  { icon: Wind,         label: 'Air conditioning' },
  { icon: Tv,           label: 'Smart TV' },
  { icon: Lock,         label: 'Private entrance' },
  { icon: Clock,        label: 'Flexible check-in' },
  { icon: MapPin,       label: '5 min from airport' },
  { icon: ShieldCheck,  label: 'Safe neighborhood' },
]

export function AmenitiesSection() {
  return (
    <section className="section-padding bg-charcoal overflow-hidden">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <span className="label-text text-gold block mb-5">What is included</span>
            <h2 className="heading-xl text-white mb-6">
              Everything you need,
              <br />
              <em className="text-gold">nothing missing</em>
            </h2>
            <p className="text-white/50 font-light leading-relaxed mb-8 max-w-md">
              All apartments come fully equipped. Free parking, fast Wi-Fi, a proper
              kitchen, and a grocery store on-site -- so you can settle in from day one.
            </p>
            <div className="h-px w-12 bg-gold" />
          </div>

          {/* Right: grid of amenities */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {amenities.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="group flex flex-col items-start gap-3 p-4 border border-white/8 hover:border-gold/40 transition-all duration-300"
              >
                <Icon
                  size={18}
                  className="text-gold/70 group-hover:text-gold transition-colors duration-300"
                  strokeWidth={1.5}
                />
                <span className="text-white/60 text-xs font-sans font-light leading-tight group-hover:text-white/90 transition-colors duration-300">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
