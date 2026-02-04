export const locales = ['en', 'ko', 'ja', 'zh'] as const;
export const defaultLocale = 'en' as const;
export type Locale = (typeof locales)[number];
