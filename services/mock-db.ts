import type { SubscriptionGroup, MySubscription, User } from '../types';

export const MOCK_USERS: User[] = [
    {
        id: 'user-1',
        name: 'Alex Doe',
        email: 'alex.doe@example.com',
        avatarUrl: `https://api.dicebear.com/8.x/adventurer/svg?seed=Alex`,
        memberSince: 'January 15, 2024',
        creditBalance: 5000,
    }
];

export const MOCK_GROUPS: SubscriptionGroup[] = [
  {
    id: '1',
    name: 'Netflix Premium',
    icon: 'netflix',
    totalPrice: 1660,
    slotsTotal: 4,
    slotsFilled: 2,
    tags: ['4K', 'UHD', 'Movies', 'Series'],
    category: 'Video',
    postedBy: { name: 'Alex T.', rating: 4.9 },
    status: 'active',
    credentials: {
      username: 'netflix-family@email.com',
      password: 'SuperSecretPassword1'
    },
    proof: 'https://i.imgur.com/receipt.png'
  },
  {
    id: '2',
    name: 'Spotify Family',
    icon: 'spotify',
    totalPrice: 1327,
    slotsTotal: 6,
    slotsFilled: 5,
    tags: ['Music', 'Ad-free', 'Podcast'],
    category: 'Music',
    postedBy: { name: 'Maria S.', rating: 4.8 },
    status: 'active',
    credentials: {
      username: 'spotify-squad@email.com',
      password: 'MusicIsLife!23'
    },
    proof: 'https://i.imgur.com/receipt.png'
  },
  {
    id: '3',
    name: 'YouTube Premium',
    icon: 'youtube',
    totalPrice: 1908,
    slotsTotal: 5,
    slotsFilled: 1,
    tags: ['Ad-free', 'Music', 'Background Play'],
    category: 'Video',
    postedBy: { name: 'David L.', rating: 4.7 },
    status: 'active',
     credentials: {
      username: 'youtube-premium@email.com',
      password: 'NoMoreAds!YT'
    },
    proof: 'https://i.imgur.com/receipt.png'
  },
  {
    id: '4',
    name: 'Disney+ Bundle',
    icon: 'disney',
    totalPrice: 1244,
    slotsTotal: 4,
    slotsFilled: 3,
    tags: ['Marvel', 'Star Wars', 'Pixar'],
    category: 'Video',
    postedBy: { name: 'Sophia C.', rating: 5.0 },
    status: 'active',
    credentials: {
      username: 'disney-fan-club@email.com',
      password: 'MickeyMouse1928'
    },
    proof: 'https://i.imgur.com/receipt.png'
  },
  {
    id: '5',
    name: 'HBO Max',
    icon: 'hbo',
    totalPrice: 1327,
    slotsTotal: 3,
    slotsFilled: 3,
    tags: ['Movies', 'Series', 'Originals'],
    category: 'Video',
    postedBy: { name: 'Chris P.', rating: 4.6 },
    status: 'full',
    credentials: {
      username: 'hbo-watchers@email.com',
      password: 'GoT_FinaleSucks'
    },
    proof: 'https://i.imgur.com/receipt.png'
  },
  {
    id: '6',
    name: 'Microsoft 365 Family',
    icon: 'office',
    totalPrice: 830,
    slotsTotal: 6,
    slotsFilled: 4,
    tags: ['Office', 'Productivity', 'Cloud'],
    category: 'Productivity',
    postedBy: { name: 'Emily R.', rating: 4.9 },
    status: 'active',
    credentials: {
      username: 'office-pros@email.com',
      password: 'ExcelIsFun$1'
    },
    proof: 'https://i.imgur.com/receipt.png'
  },
   {
    id: '7',
    name: 'Adobe Creative Cloud',
    icon: 'adobe',
    totalPrice: 4564,
    slotsTotal: 2,
    slotsFilled: 1,
    tags: ['Design', 'Photo', 'Video'],
    category: 'Design',
    postedBy: { name: 'Jordan B.', rating: 4.8 },
    status: 'pending_review',
    credentials: {
      username: 'adobe-creatives@email.com',
      password: 'PhotoshopMaster!2'
    },
    proof: 'https://i.imgur.com/receipt.png'
  },
  {
    id: '8',
    name: 'Canva Pro Team',
    icon: 'canva',
    totalPrice: 2489,
    slotsTotal: 5,
    slotsFilled: 2,
    tags: ['Design', 'Templates', 'Social Media'],
    category: 'Design',
    postedBy: { name: 'Olivia M.', rating: 5.0 },
    status: 'active',
    credentials: {
      username: 'canva-designers@email.com',
      password: 'Templates4Days#'
    },
    proof: 'https://i.imgur.com/receipt.png'
  }
];

// This table links users to groups
export const MOCK_MEMBERSHIPS: Array<Omit<MySubscription, 'postedBy' | 'tags' | 'category' | 'icon' | 'name'> & { userId: string, groupId: string }> = [
  {
    userId: 'user-1',
    groupId: '2', // Spotify
    id: '2',
    membershipType: 'monthly',
    nextPaymentDate: 'July 25, 2024',
    myShare: 221,
    totalPrice: 1327, slotsFilled: 5, slotsTotal: 6, status: 'active'
  },
   {
    userId: 'user-1',
    groupId: '4', // Disney+
    id: '4',
    membershipType: 'monthly',
    nextPaymentDate: 'July 15, 2024',
    myShare: 311,
    totalPrice: 1244, slotsFilled: 3, slotsTotal: 4, status: 'active'
  },
  {
    userId: 'user-1',
    groupId: '1', // Netflix
    id: '1',
    membershipType: 'temporary',
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 10 days
    myShare: 415,
    totalPrice: 1660, slotsFilled: 2, slotsTotal: 4, status: 'active'
  }
];

export let MOCK_WITHDRAWAL_REQUESTS: any[] = [];