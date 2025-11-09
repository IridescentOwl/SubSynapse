export interface SubscriptionGroup {
  id: string;
  name: string;
  icon: IconName;
  totalPrice: number;
  slotsTotal: number;
  slotsFilled: number;
  tags: string[];
  category: 'Video' | 'Music' | 'Productivity' | 'Design';
  postedBy: {
    name: string;
    rating: number;
  };
  status: 'active' | 'pending_review' | 'full';
  credentials?: {
      username: string;
      password?: string; // Password should only be sent to members
  };
  proof?: string; // e.g., a URL to a screenshot of the receipt
}

export interface MySubscription extends SubscriptionGroup {
  membershipType: 'monthly' | 'temporary';
  myShare: number;
  nextPaymentDate?: string;
  endDate?: string;
}

import { ROLES } from "./constants";
export type Role = typeof ROLES[keyof typeof ROLES];

export interface User {
  id: string;
  name: string;
  email: string;

  // your existing fields
  avatarUrl: string;
  memberSince: string;
  creditBalance: number;

  // ✅ required for admin panel
  role: Role;           // "admin" | "user"
  isActive: boolean;    // enabled / disabled
  createdAt: string;    // ISO timestamp
}


export type IconName = 'netflix' | 'spotify' | 'youtube' | 'disney' | 'hbo' | 'office' | 'adobe' | 'canva';