import type { NextFetchEvent, NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { localesConfig } from './config/locales';
import { authRoute } from './routes/authRoute';
import { unAuthRoute } from './routes/unAuthRoute';
const intlMiddleware = createMiddleware({
  locales: localesConfig.locales,
  localePrefix: localesConfig.localePrefix,
  defaultLocale: localesConfig.defaultLocale,
});
/**
 *
 */
export default function middleware(request: NextRequest, _event: NextFetchEvent) {
  console.log(request.url);
  const authResponse = authRoute(request);
  if (authResponse) {
    return authResponse;
  }
  const unAuthResponse = unAuthRoute(request);
  if (unAuthResponse) {
    return unAuthResponse;
  }
  return intlMiddleware(request);
}
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'], // Also exclude tunnelRoute used in Sentry from the matcher
};
