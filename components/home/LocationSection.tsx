// components/home/LocationSection.tsx

export function LocationSection() {
  return (
    <section id="location" className="section-padding bg-champagne/30">
      <div className="container-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text */}
          <div>
            <span className="label-text block mb-5">Our Location</span>
            <h2 className="heading-xl text-charcoal mb-6">
              Perfectly Located
              <br />
              <em className="text-gold">in Ilidza</em>
            </h2>
            <p className="text-taupe font-light leading-relaxed mb-8 max-w-md">
              Cataleya Residence is located in Ilidza -- a peaceful residential area close
              to Sarajevo International Airport, with quick access to the city centre.
              Ideal for both business travellers and families looking for comfort and convenience.
            </p>

            <ul className="space-y-4 mb-10">
              {[
                { label: 'Sarajevo International Airport', distance: '5 min drive' },
                { label: 'Ilidza City Centre',             distance: '5 min drive' },
                { label: 'Sarajevo City Centre',           distance: '15 min drive' },
                { label: 'Old Town (Bascarsija)',          distance: '20 min drive' },
              ].map((item) => (
                <li key={item.label} className="flex items-center justify-between border-b border-champagne-dark pb-4">
                  <span className="text-charcoal text-sm font-sans font-light">{item.label}</span>
                  <span className="text-gold text-xs font-sans font-500 tracking-wide">{item.distance}</span>
                </li>
              ))}
            </ul>

            {/* Address */}
            <p className="text-taupe text-sm font-sans font-light mb-6">
              <span className="font-500 text-charcoal">Address:</span>{' '}
              Barska 2C, Ilidza, Sarajevo
            </p>

            <a
              href="https://maps.google.com/?q=Barska+2C+Ilidza+Sarajevo"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2 text-sm"
            >
              Open in Google Maps
            </a>
          </div>

          {/* Map embed */}
          <div className="relative aspect-[4/3] overflow-hidden shadow-luxury-lg">
            <iframe
              src="https://www.google.com/maps?q=Barska+2C+Ilidza+Sarajevo&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, position: 'absolute', inset: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Cataleya Residence -- Barska 2C, Ilidza, Sarajevo"
            />
          </div>

        </div>
      </div>
    </section>
  )
}
