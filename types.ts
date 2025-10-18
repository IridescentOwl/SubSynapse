export interface SubscriptionGroup {
  id: string;
  name: string;
  icon: IconName;
  totalPrice: number;
  slotsTotal: number;
  slotsFilled: number;
  tags: string[];
  category: 'Video' | 'Music' | 'Productivity' | 'Design';
}

export interface MySubscription extends SubscriptionGroup {
  nextPaymentDate: string;
  myShare: number;
}

export type IconName = 'netflix' | 'spotify' | 'youtube' | 'disney' | 'hbo' | 'office' | 'adobe' | 'canva';