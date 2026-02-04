import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'ko', 'ja', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // en은 prefix 없이, ko/ja/zh만 prefix
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
