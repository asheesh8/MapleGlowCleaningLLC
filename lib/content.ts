/**
 * Single source of truth for business info + marketing copy.
 * Sourced from the Maple Glow Cleaning LLC Facebook page.
 */

export const business = {
  name: 'Maple Glow Cleaning',
  legalName: 'Maple Glow Cleaning LLC',
  owner: 'Katie Proper',
  tagline: 'Reliable, insured cleaning for homes and businesses in Vermont.',
  /** Katie's own taglines, from her flyer. */
  slogan: 'A clean space. A brighter you.',
  motto: 'Reliable. Thorough. Trusted.',
  phone: '+1 802-305-8787',
  phoneHref: 'tel:+18023058787',
  email: 'propsk28@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61590621946523',
  serviceArea: 'Vermont',
} as const;

export type ServiceId =
  | 'residential'
  | 'deep'
  | 'windows'
  | 'grout'
  | 'stains'
  | 'carpet'
  | 'organizing';

export interface Service {
  id: ServiceId;
  name: string;
  short: string;
  description: string;
  includes: string[];
  /** Base price floor in dollars, before size/frequency adjustments. */
  base: number;
  icon: string;
}

export const services: Service[] = [
  {
    id: 'residential',
    name: 'Residential & Airbnb',
    short: 'Homes and turnovers',
    description:
      'Regular home cleaning and fast Airbnb turnovers. The same standard every visit, so guests walk into a space that looks exactly like the listing photos.',
    includes: [
      'Kitchens & bathrooms fully reset',
      'Floors vacuumed & mopped',
      'Dusting & surface sanitizing',
      'Beds made, linens changed',
      'Guest-ready staging for rentals',
    ],
    base: 130,
    icon: 'home',
  },
  {
    id: 'deep',
    name: 'Deep Cleans',
    short: 'The full reset',
    description:
      'Top-to-bottom detail work — baseboards, inside appliances, light fixtures, the spots that get skipped. Best as a first visit or a seasonal refresh.',
    includes: [
      'Every room, floor to ceiling',
      'Inside oven & refrigerator',
      'Baseboards, trim & door frames',
      'Fixture & tile descaling',
      'Interior windows & sills',
    ],
    base: 190,
    icon: 'sparkles',
  },
  {
    id: 'windows',
    name: 'Window Cleaning',
    short: 'Let the light in',
    description:
      'Interior and accessible exterior glass, plus tracks and sills — the difference you notice every single morning.',
    includes: [
      'Interior glass streak-free',
      'Accessible exterior glass',
      'Tracks & sills detailed',
      'Screens rinsed',
    ],
    base: 95,
    icon: 'window',
  },
  {
    id: 'grout',
    name: 'Grout Cleaning & Sealing',
    short: 'Back to the original color',
    description:
      'Deep-scrubbed tile and grout, then sealed so it stays that way. The single biggest visual change in most bathrooms and kitchens.',
    includes: [
      'Grout deep-scrubbed',
      'Tile descaled & polished',
      'Sealant applied after drying',
      'Mildew & soap scum removed',
    ],
    base: 150,
    icon: 'grid',
  },
  {
    id: 'stains',
    name: 'Stain Removal',
    short: 'The stubborn stuff',
    description:
      'Targeted treatment for the marks normal cleaning leaves behind — rust, hard water, grease, and set-in spots.',
    includes: [
      'Hard water & rust treatment',
      'Grease & smoke residue',
      'Upholstery spot treatment',
      'Honest assessment first',
    ],
    base: 85,
    icon: 'droplet',
  },
  {
    id: 'carpet',
    name: 'Rug & Carpet Cleaning',
    short: 'Down to the fibers',
    description:
      'Deep extraction for carpets, area rugs, and runners. Pet accidents, traffic lanes, and the general dinginess you stop noticing until it is gone.',
    includes: [
      'Hot water extraction',
      'Pet stain & odor treatment',
      'Traffic-lane restoration',
      'Area rugs & runners',
    ],
    base: 140,
    icon: 'layers',
  },
  {
    id: 'organizing',
    name: 'Trash Removal & Organizing',
    short: 'Clear the decks',
    description:
      'Haul-out and reset for spaces that got away from you. Great before a move, after a project, or when the garage stopped closing.',
    includes: [
      'Trash & recycling hauled out',
      'Closets & pantries reset',
      'Garage & basement clear-out',
      'Donation pile sorted',
    ],
    base: 120,
    icon: 'box',
  },
];

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export const addOns: AddOn[] = [
  { id: 'fridge', name: 'Inside refrigerator', price: 35 },
  { id: 'oven', name: 'Inside oven', price: 35 },
  { id: 'windows', name: 'Interior windows', price: 45 },
  { id: 'laundry', name: 'Laundry (wash / dry / fold)', price: 40 },
  { id: 'cabinets', name: 'Inside cabinets', price: 40 },
  { id: 'garage', name: 'Garage sweep-out', price: 50 },
  { id: 'pets', name: 'Pet hair deep treatment', price: 30 },
  { id: 'basement', name: 'Finished basement', price: 45 },
];

export const frequencies = [
  { id: 'once', label: 'One time', discount: 0, note: 'No commitment' },
  { id: 'monthly', label: 'Monthly', discount: 0.05, note: 'Save 5%' },
  { id: 'biweekly', label: 'Every 2 weeks', discount: 0.1, note: 'Save 10%' },
  { id: 'weekly', label: 'Weekly', discount: 0.15, note: 'Save 15%' },
] as const;

/** Owner bio — adapted from Katie's July 20 Facebook post. */
export const ownerBio = {
  greeting: "I'm Katie.",
  body: [
    "I own Maple Glow Cleaning, and I'm the one you'll see at every single visit. No rotating crews, no strangers in your home — just me, every time.",
    'I started this business because I believe a clean home changes how a week feels. Vermont families work hard, and coming home to something that already feels handled is worth a lot.',
    'Fully insured, flexible on scheduling, and honest about what a job will take. Thank you for trusting me with your homes.',
  ],
  signature: 'Katie Proper, Owner',
};

export const trustPoints = [
  { label: 'Fully insured', detail: 'Licensed Vermont LLC, covered on every job' },
  { label: 'Solo operator', detail: 'Katie is at every visit — always' },
  { label: 'Vermont based', detail: 'Proudly serving all of Vermont' },
  { label: 'Flexible scheduling', detail: 'Evenings and weekends available' },
];

/**
 * Seed testimonial. This comment is public on Katie's Facebook page — confirm
 * with her (and ideally the commenter) before the site goes live.
 */
export const seedTestimonials = [
  {
    author: 'Shawn Sims',
    body: 'Absolutely Awesome!!!! Love the name!!! Go get em Girl!!!!',
    source: 'facebook',
    order: 0,
  },
];

/** Marketing copy pulled from her July 16 post. */
export const painPoints = [
  'Laundry piling up faster than you can fold it?',
  "Can't remember the last time the windows were clear?",
  'Kids leaving a trail through every room?',
  'Too much life happening to keep up with the house?',
];

/**
 * Verified before/after pairs — same scene, photographed by Katie before and
 * after the job. Ordered from most to least self-explanatory.
 */
export interface BeforeAfterPair {
  id: string;
  label: string;
  caption: string;
  before: string;
  after: string;
}

export const beforeAfter: BeforeAfterPair[] = [
  {
    id: 'bathroom',
    label: 'Guest bathroom',
    caption: 'Hard-water and rust staining lifted from the bowl, seat, and pedestal sink.',
    before: '/gallery/mg-35.jpg',
    after: '/gallery/mg-25.jpg',
  },
  {
    id: 'oven',
    label: 'Oven',
    caption: 'Baked-on grease cut back off the glass, door, and racks.',
    before: '/gallery/mg-39.jpg',
    after: '/gallery/mg-41.jpg',
  },
  {
    id: 'coffee',
    label: 'Coffee station',
    caption: 'Every appliance wiped down, descaled, and put back straight.',
    before: '/gallery/mg-27.jpg',
    after: '/gallery/mg-12.jpg',
  },
  {
    id: 'undersink',
    label: 'Under the sink',
    caption: 'Spills, residue, and debris cleared out of the cabinet base.',
    before: '/gallery/mg-44.jpg',
    after: '/gallery/mg-45.jpg',
  },
];
