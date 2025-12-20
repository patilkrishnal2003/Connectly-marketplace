export interface Deal {
  id?: string;
  title?: string;
  company?: string;
  partner?: string;
  logo?: string;
  realm?: string;
  category?: string;
  discount?: string;
  description?: string;
  longDescription?: string;
  value?: string;
  offerTitle?: string;
  tier?: string;
  featured?: boolean;
  rating?: number;
  coupon_code?: string;
  link?: string;
  requirements?: string[];
  steps?: string[];
  claimedCount?: number;
  expiresAt?: string;
  expires_on?: string;
  expires?: string;
  image_url?: string;
  isUnlocked?: boolean;
}
