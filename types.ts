
export interface StoreProfile {
  storeName: string;
  logoUrl: string | null;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  termsAccepted: boolean;
  password?: string;
  themeColor?: string;
  apiKey?: string; // Google Gemini API Key
}

export enum ItemType {
  COIN = 'מטבע',
  STAMP = 'בול',
}

export type ItemStatus = 'AVAILABLE' | 'SOLD';

export interface AIAnalysisResult {
  itemName: string;
  year: string;
  origin: string;
  conditionGrade: string;
  anomalies: string[];
  estimatedValueRange: string;
  description: string;
  confidenceScore: number;
}

export interface CollectibleItem {
  id: string;
  type: ItemType;
  status: ItemStatus; // New field for Availability status
  frontImage: string; // Base64
  backImage: string; // Base64
  analysis: AIAnalysisResult | null;
  userPrice: string;
  createdAt: number;
}

export type ViewState = 'setup' | 'dashboard' | 'scan' | 'legal' | 'details' | 'storefront' | 'product' | 'login';
