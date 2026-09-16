export type Language = 'ar' | 'en';

export type CategoryType = 
  | 'all'
  | 'will_power'
  | 'wisdom_philosophy'
  | 'future_science'
  | 'inner_peace'
  | 'leadership';

export interface Quote {
  id: string;
  text: string;
  author: string;
  authorTitle?: string;
  category: CategoryType;
  tags: string[];
  ambientColor: 'cyan' | 'purple' | 'amber' | 'emerald' | 'rose' | 'indigo';
  isQuoteOfTheDay?: boolean;
  // English translation fields
  textEn?: string;
  authorEn?: string;
  authorTitleEn?: string;
  tagsEn?: string[];
}

export interface Reflection {
  id: string;
  quoteId: string;
  quoteText: string;
  quoteAuthor: string;
  userNote: string;
  mood?: string;
  createdAt: string;
}

export type LegalModalType = 'privacy' | 'disclaimer' | 'cookies' | 'founder' | null;
