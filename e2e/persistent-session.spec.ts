/**
 * TRUE browser-restart session persistence test.
 *
 * Uses launchPersistentContext (a real on-disk WebKit profile) so that
 * cookie persistence behaves exactly like Safari does for real users.
 * This is different from Playwright's storageState which is just an
 * in-memory JSON snapshot — this test writes to disk and relaunches
 * the browser process to verify cookies survive a real process restart.
 */

import { test, expect, webkit } from '@playwright/test'
import { encode } from 'next-auth/jwt'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? 'centraly-super-secret-2026'
const SESSION_MAX_AGE = 30 * 24 * 60 * 60

async function createSessionToken(email: string): Promise<string> {
  return encode({
    token: { email, name: 'Test User', sub: 'google-test-123' },
    secret: NEXTAUTH_SECRET,
    maxAge: SESSION_MAX_AGE,
  })
}

const PROFILE_DIR = path.join(os.tmpdir(), 'webkit-persistent-test-profile')

test.describe('TRUE restart persistence (persistent profile)', () => {
  test.beforeAll(() => {
    // Clean slate each run
    if (fs.existsSync(PROFILE_DIR)) fs.rmSync(PROFILE_DIR, { recursive: true })
    fs.mkdirSync(PROFILE_DIR, { recursive: true })
  })

  test('cookie survives a real browser process restart', async () => {
    const token = await createSessionToken('abubakr6kouma@gmail.com')
    const isSecure = BASE_URL.startsWith('https://')
    const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
    const host = new URL(BASE_URL).hostname

    // ── Phase 1: "Login" — launch persistent browser, set cookie, close ──
    console.log('\n[Phase 1] Launching persistent WebKit, setting session cookie...')
    {
      const ctx = await webkit.launchPersistentContext(PROFILE_DIR, {
        headless: true,
        ignoreHTTPSErrors: true,
      })
      const page = await ctx.newPage()

      // Visit the site first so the browser accepts the cookie
      await page.goto(BASE_URL)

      // Set the session cookie via JS (mirrors what the server sets)
      await ctx.addCookies([
        {
          name: cookieName,
          value: token,
          domain: host,
          path: '/',
          httpOnly: true,
          secure: isSecure,
          sameSite: 'Lax',
          expires: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
        },
      ])

      // Verify the cookie is readable before closing
      const cookies = await ctx.cookies(BASE_URL)
      const sessionCookie = cookies.find((c) => c.name === cookieName)
      console.log('[Phase 1] Cookie set:', sessionCookie ? '✓' : '✗')
      console.log('[Phase 1] Cookie expires:', sessionCookie ? new Date(sessionCookie.expires * 1000).toISOString() : 'N/A')
      expect(sessionCookie).toBeTruthy()
      expect(sessionCookie?.expires).toBeGreaterThan(Date.now() / 1000 + 86400) // at least 1 day from now

      // Close the browser (simulate quit)
      await ctx.close()
      console.log('[Phase 1] Browser closed.')
    }

    // Small delay to ensure disk writes are flushed
    await new Promise((r) => setTimeout(r, 500))

    // ── Phase 2: "Reopen" — fresh browser process, same profile ──
    console.log('[Phase 2] Relaunching browser with same profile...')
    {
      const ctx = await webkit.launchPersistentContext(PROFILE_DIR, {
        headless: true,
        ignoreHTTPSErrors: true,
      })

      const cookies = await ctx.cookies(BASE_URL)
      const sessionCookie = cookies.find((c) => c.name === cookieName)
      console.log('[Phase 2] Cookie still present after restart:', sessionCookie ? '✓' : '✗ LOST')
      console.log('[Phase 2] Cookie value (first 20 chars):', sessionCookie?.value?.slice(0, 20) ?? 'N/A')

      if (!sessionCookie) {
        console.error('[Phase 2] COOKIE WAS DELETED — this is the root cause of the session loss')
      }

      expect(sessionCookie, 'Session cookie should survive browser restart').toBeTruthy()

      // Now navigate to the app and verify redirect to /dashboard
      const page = await ctx.newPage()
      await page.goto(BASE_URL)
      console.log('[Phase 2] Landed at:', page.url())

      await page.waitForURL((url) => url.pathname.startsWith('/dashboard'), {
        timeout: 15_000,
      })
      console.log('[Phase 2] Redirected to dashboard: ✓')

      await expect(page).toHaveURL(new RegExp(`${BASE_URL}/dashboard`))
      await ctx.close()
    }
  })

  test.afterAll(() => {
    if (fs.existsSync(PROFILE_DIR)) fs.rmSync(PROFILE_DIR, { recursive: true })
  })
})
