const services = [
  {
    name: 'Maid & Housekeeping',
    image: '/images/maid.jpg',
    link: 'https://www.primehomeease.com/services/maid-housekeeping',
  },
  {
    name: 'Nanny & Childcare',
    image: '/images/nanny.jpeg',
    link: 'https://www.primehomeease.com/services/nanny-babysitter-childcare',
  },
  {
    name: 'Home Cleaning',
    image: '/images/cleaner.jpeg',
    link: 'https://www.primehomeease.com/services/home-cleaning',
  },
  {
    name: 'Elder Care',
    image: '/images/eldercare.jpeg',
    link: 'https://www.primehomeease.com/services/elder-care',
  },
  {
    name: 'Experienced Cooks',
    image: 'https://www.primehomeease.com/brand/cook.jpeg',
    link: 'https://www.primehomeease.com/services/experienced-cooks',
  },
  {
    name: 'Professional Chefs',
    image: 'https://www.primehomeease.com/brand/chef.jpeg',
    link: 'https://www.primehomeease.com/services/professional-chefs',
  },
];

export default function HomeEaseBand() {
  return (
    <div
      data-testid="section-homeease"
      className="absolute inset-x-0 bottom-0 z-30 w-full px-1.5 pb-1.5 sm:px-4 sm:pb-3">
        <div className="mx-auto w-full max-w-[1500px] overflow-hidden rounded-[1rem] border border-white/15 bg-ocean-deep/50 px-2 py-1 sm:px-3 sm:py-1 shadow-[0_6px_20px_rgba(0,0,0,0.12)] backdrop-blur-md sm:px-4 sm:py-2.5">
        
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">
          
          {/* LEFT — From our family */}
          <a
            href="https://www.primehomeease.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5"
          >
            <img
              src="/images/phelogo.webp"
              alt="Prime HomeEase"
              className="h-8 w-8 rounded-lg bg-white object-contain p-1 shadow-md sm:h-9 sm:w-9"
            />

            <div className="hidden sm:block">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-gold">
                FROM OUR FAMILY
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-white/85">
                A trusted home-services partner
              </p>
            </div>
          </a>

          {/* CENTER — Main brand message */}
          <div className="min-w-0 text-center">
            <a
              href="https://www.primehomeease.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block font-body text-sm font-extrabold uppercase tracking-[0.06em] text-white sm:text-xl"
            >
              PRIME HOMEEASE
            </a>

            <p className="text-xs font-bold text-gold sm:text-xs">
              Premium Household Services
            </p>

            <p className="mx-auto mt-1 hidden max-w-4xl text-sm font-extrabold leading-snug text-white sm:block sm:text-base lg:text-lg">
              Find experienced maids, nannies, caregivers, cleaners, cooks and professional chefs for your home.
            </p>
          </div>

          {/* RIGHT — CTA */}
          <a
            href="https://www.primehomeease.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-white px-4 py-2 text-[10px] font-extrabold text-ocean-deep shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold sm:px-5 sm:py-2 sm:text-[11px]"
          >
            Explore Prime HomeEase
            <span aria-hidden="true">↗</span>
          </a>
        </div>

        {/* SERVICE CARDS */}
        <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-2.5 sm:grid-cols-6 sm:gap-3">
          {services.map((service) => (
            <a
              key={service.name}
              href={service.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group min-w-0"
            >
              <div className="overflow-hidden rounded-[0.7rem] border border-white/12 bg-white/10 p-0.5 shadow-[0_7px_18px_rgba(0,0,0,0.16)] transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="aspect-[2.45/1] overflow-hidden rounded-[0.55rem]">
                  <img
                    src={service.image}
                    alt={service.name}
                    loading="lazy"
                    className="h-full w-full scale-[0.80] object-cover object-[center_16%] transition-transform duration-500 group-hover:scale-[0.91]"
                  />
                </div>

                <p className="truncate px-1 py-1 text-center text-[8px] font-extrabold text-white sm:text-[11px]">
                  {service.name}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
