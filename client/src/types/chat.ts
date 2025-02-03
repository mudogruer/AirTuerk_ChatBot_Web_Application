export type Language = 'de' | 'en' | 'tr';

export const LanguageMap: Record<Language, string> = {
  de: 'German',
  en: 'English',
  tr: 'Turkish'
};

export interface Message {
  text: string;
  isUser: boolean;
} 