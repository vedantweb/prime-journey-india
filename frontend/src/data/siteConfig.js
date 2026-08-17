export const siteConfig = {
  name: 'Prime Journey India',
  domain: 'PrimeJourneyIndia.com',
  tagline: 'India, Your Way.',
  phone: '+91 8699913245',
  phoneHref: 'tel:+918699913245',
  email: 'contact@primejourneyindia.com',
  bookingsEmail: 'Bookings@primejourneyindia.com',
  whatsapp: {
    display: '+91 8699913245',
    url: 'https://wa.me/918699913245?text=' + encodeURIComponent('Hello Prime Journey India, I would like to plan a trip.'),
  },
  sisterBrand: {
    name: 'Prime HomeEase',
    url: 'https://primehomeease.com',
    services: ['Maids', 'Nannies', 'Housekeeping', 'Home Cleaning', 'Elder Care', 'Cooks'],
  },
  social: {
    instagram: 'https://www.instagram.com/primejourneyindia/',
    facebook: process.env.REACT_APP_FACEBOOK_URL || '',
    youtube: process.env.REACT_APP_YOUTUBE_URL || '',
    x: process.env.REACT_APP_X_URL || '',
  },
  credit: { label: 'Vedanta Web', url: 'https://vedantaweb.com/' },
  languages: ['English', 'Hindi', 'Punjabi'],
  address: [
    'Prime Journey India',
    'Baba Deep Singh Avenue',
    'Near Punjab National Bank, Nangli Branch',
    'Amritsar, Punjab 143001',
    'India',
  ],
  mapEmbed: 'https://www.google.com/maps?q=31.677572,74.879677&z=16&output=embed',
  directionsUrl:
    'https://www.google.com/maps?ll=31.677718,74.883218&z=16&t=m&hl=en-GB&gl=US&mapclient=embed&q=31%C2%B040%2739.3%22N+74%C2%B052%2746.8%22E+31.677572,+74.879677@31.677572,74.879677',
};

// SINGLE SOURCE OF TRUTH for brand & people imagery.
// Drop the real files into frontend/public/assets/ — every location
// (homepage, About, admin welcome, admin dashboard) updates automatically.
export const assets = {
  logo: '/assets/logo.png',
  founder: '/assets/founder.jpeg',
  cofounder1: '/assets/cofounder1.jpeg',
  cofounder2: '/assets/cofounder2.jpeg',
};

export const navLinks = [
  { label: 'Destinations', target: 'destinations' },
  { label: 'Holidays', target: 'holidays' },
  { label: 'Experiences', target: 'experiences' },
  { label: 'Packages', target: 'packages' },
  { label: 'Customize', target: 'customize' },
  { label: 'Feedback', action: 'feedback' },
  { label: 'About', target: '/about' },
];

export const img = (id, w = 1600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
