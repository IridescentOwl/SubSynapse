import type { SubscriptionGroup, MySubscription } from './types';

export const SUBSCRIPTION_GROUPS: SubscriptionGroup[] = [
  {
    id: '1',
    name: 'Netflix Premium',
    icon: 'netflix',
    totalPrice: 1660, // ~19.99 USD
    slotsTotal: 4,
    slotsFilled: 2,
    tags: ['4K', 'UHD', 'Movies', 'Series'],
    category: 'Video',
    postedBy: { name: 'Alex T.', rating: 4.9 },
  },
  {
    id: '2',
    name: 'Spotify Family',
    icon: 'spotify',
    totalPrice: 1327, // ~15.99 USD
    slotsTotal: 6,
    slotsFilled: 5,
    tags: ['Music', 'Ad-free', 'Podcast'],
    category: 'Music',
    postedBy: { name: 'Maria S.', rating: 4.8 },
  },
  {
    id: '3',
    name: 'YouTube Premium',
    icon: 'youtube',
    totalPrice: 1908, // ~22.99 USD
    slotsTotal: 5,
    slotsFilled: 1,
    tags: ['Ad-free', 'Music', 'Background Play'],
    category: 'Video',
    postedBy: { name: 'David L.', rating: 4.7 },
  },
  {
    id: '4',
    name: 'Disney+ Bundle',
    icon: 'disney',
    totalPrice: 1244, // ~14.99 USD
    slotsTotal: 4,
    slotsFilled: 3,
    tags: ['Marvel', 'Star Wars', 'Pixar'],
    category: 'Video',
    postedBy: { name: 'Sophia C.', rating: 5.0 },
  },
  {
    id: '5',
    name: 'HBO Max',
    icon: 'hbo',
    totalPrice: 1327, // ~15.99 USD
    slotsTotal: 3,
    slotsFilled: 3,
    tags: ['Movies', 'Series', 'Originals'],
    category: 'Video',
    postedBy: { name: 'Chris P.', rating: 4.6 },
  },
  {
    id: '6',
    name: 'Microsoft 365 Family',
    icon: 'office',
    totalPrice: 830, // ~9.99 USD
    slotsTotal: 6,
    slotsFilled: 4,
    tags: ['Office', 'Productivity', 'Cloud'],
    category: 'Productivity',
    postedBy: { name: 'Emily R.', rating: 4.9 },
  },
   {
    id: '7',
    name: 'Adobe Creative Cloud',
    icon: 'adobe',
    totalPrice: 4564, // ~54.99 USD
    slotsTotal: 2,
    slotsFilled: 1,
    tags: ['Design', 'Photo', 'Video'],
    category: 'Design',
    postedBy: { name: 'Jordan B.', rating: 4.8 },
  },
  {
    id: '8',
    name: 'Canva Pro Team',
    icon: 'canva',
    totalPrice: 2489, // ~29.99 USD
    slotsTotal: 5,
    slotsFilled: 2,
    tags: ['Design', 'Templates', 'Social Media'],
    category: 'Design',
    postedBy: { name: 'Olivia M.', rating: 5.0 },
  }
];

export const MY_SUBSCRIPTIONS: MySubscription[] = [
  {
    ...SUBSCRIPTION_GROUPS[1], // Spotify Family
    nextPaymentDate: 'July 25, 2024',
    myShare: 221, // ~2.67 USD
  },
  {
    ...SUBSCRIPTION_GROUPS[3], // Disney+ Bundle
    nextPaymentDate: 'July 15, 2024',
    myShare: 311, // ~3.75 USD
  },
  {
    ...SUBSCRIPTION_GROUPS[5], // Microsoft 365
    nextPaymentDate: 'July 10, 2024',
    myShare: 139, // ~1.67 USD
  },
];