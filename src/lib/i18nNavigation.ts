import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { localesConfig } from '@/config/locales';
export const { usePathname, useRouter } = createSharedPathnamesNavigation({
  locales: localesConfig.locales,
  localePrefix: localesConfig.localePrefix,
});
