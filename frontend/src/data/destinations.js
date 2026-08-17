import { img } from './siteConfig';

export const heroSlides = [
  {
    key: 'rajasthan',
    eyebrow: 'Royal India',
    headline: 'Explore Rajasthan',
    sub: 'Where royal heritage meets unforgettable journeys.',
    image: img('1599661046289-e31897846e41', 2000),
    alt: 'Amber Fort, Jaipur at dusk',
    theme: 'warm',
    effects: ['sunrays', 'dust', 'birds', 'bunting'],
    cta: { primary: 'Explore Rajasthan', secondary: 'View Packages' },
  },
  {
    key: 'kashmir',
    eyebrow: 'The Valley',
    headline: 'Explore Kashmir',
    sub: 'Where every season looks like a dream.',
    image: img('1595815771614-ade9d652a65d', 2000),
    alt: 'Houseboats on Dal Lake beneath snow-covered mountains, Srinagar',
    theme: 'cool',
    effects: ['snow', 'mist', 'clouds', 'birds', 'shimmer', 'droplet'],
    cta: { primary: 'Explore Kashmir', secondary: 'View Packages' },
  },
  {
    key: 'amritsar',
    eyebrow: 'The Holy City',
    headline: 'Explore Amritsar',
    sub: 'A city of faith, history and unforgettable moments.',
    image: img('1621377099913-ac1ec4848e52', 2000),
    alt: 'Sri Harmandir Sahib (Golden Temple) under a bright blue sky, Amritsar',
    theme: 'gold',
    effects: ['sunrays', 'clouds', 'birds', 'bunting', 'shimmer'],
    cta: { primary: 'Explore Amritsar', secondary: 'View Packages' },
  },
];

export const destinations = [
  {
    id: 'kashmir',
    name: 'Kashmir',
    tagline: 'Paradise, in every season.',
    image: img('1594640614203-436526f3d980', 1400),
    alt: 'Traveller beside a vivid blue high-altitude lake in Kashmir',
    size: 'large',
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    tagline: 'Where every fort tells a royal story.',
    image: img('1477587458883-47145ed94245', 1200),
    alt: 'Hawa Mahal, Jaipur with decorated cows on the street',
    size: 'tall',
  },
  {
    id: 'amritsar',
    name: 'Amritsar',
    tagline: 'Faith, flavour and the bravest border on earth.',
    image: img('1514222134-b57cbb8ce073', 1200),
    alt: 'Golden Temple glowing at dusk, Amritsar',
    size: 'wide',
  },
  {
    id: 'himachal',
    name: 'Himachal',
    tagline: 'Cedar forests and snow-lined ridges.',
    image: img('1605649487212-47bdab064df7', 1200),
    alt: 'Snow-dusted Himalayan ridge with pine forest, Himachal Pradesh',
    size: 'wide',
  },
  {
    id: 'kerala',
    name: 'Kerala',
    tagline: "God's own green country.",
    image: img('1602216056096-3b40cc0c9944', 1200),
    alt: 'Houseboat drifting through Kerala backwaters',
    size: 'tall',
  },
  {
    id: 'goa',
    name: 'Goa',
    tagline: 'Sun, salt and susegad.',
    image: img('1512343879784-a960bf40e7f2', 1200),
    alt: 'Palm-fringed beach in Goa',
    size: 'square',
  },
  {
    id: 'northeast',
    name: 'Northeast',
    tagline: "India's wildest, gentlest frontier.",
    image: img('1573398643956-2b9e6ade3456', 1200),
    alt: 'Giant Buddha statue amid Himalayan mist, Sikkim',
    size: 'square',
  },
  {
    id: 'uttarakhand',
    name: 'Uttarakhand',
    tagline: 'The land of gods and glaciers.',
    image: img('1454496522488-7a8e488e8606', 1200),
    alt: 'Mist rolling over Himalayan ridges, Uttarakhand',
    size: 'wide',
  },
];

export const customizeImage = {
  src: img('1524492412937-b28074a5d7da', 1400),
  alt: 'Taj Mahal at sunrise, Agra',
};

export const aboutHeroImage = {
  src: img('1458668383970-8ddd3927deed', 2000),
  alt: 'Still mountain lake reflecting Himalayan peaks',
};
