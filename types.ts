
export interface PostFormData {
  businessName: string;
  category: string;
  city: string;
  audience: string;
  topic: string;
}

export interface BusinessProfile {
  id: string;
  businessName: string;
  category: string;
  city: string;
  audience: string;
}

export interface GeneratedPost {
  body: string;
  cta: string;
  imageUrl?: string;
  timestamp: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
