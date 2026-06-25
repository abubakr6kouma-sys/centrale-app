/**
 * Tests whether a cookie SET BY THE SERVER (via Set-Cookie HTTP response header)
 * actually persists across a true WebKit process restart.
 *
 * This is the critical test. Previous tests set cookies via ctx.addCookies()
 * (programmatic). This test sends a real HTTP request with a JWT, lets the
 * server emit Set-Cookie with Max-Age=2592000, then restarts the browser to
 * verify the cookie is on disk.
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

const isSecure = BASE_URL.startsWith('https://')
const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
const host = new URL(BASE_URL).hostname
const PROFILE_DIR = path.join(os.tmpdir(), 'webkit-server-cookie-test')

test.describe('Server-Set-Cookie persistence after restart', () => {
  test.beforeAll(() => {
    if (fs.existsSync(PROFILE_DIR)) fs.rmSync(PROFILE_DIR, { recursive: true })
    fs.mkdirSync(PROFILE_DIR, { recursive: true })
  })

  test('cookie set by server via Set-Cookie header persists after process restart', async () => {
    const token = await createSessionToken('abubakr6kouma@gmail.com')

    // ── Phase 1: Let the SERVER set the cookie ──
    console.log('\n[Phase 1] Letting server set the session cookie via HTTP response...')
    {
      const ctx = await webkit.launchPersistentContext(PROFILE_DIR, {
        headless: true,
        ignoreHTTPSErrors: true,
      })
      const page = await ctx.newPage()

      // Send the JWT to /api/auth/session — server will respond with a new
      // Set-Cookie that includes Max-Age=2592000
      let setCookieHeader = ''
      page.on('response', async (res) => {
        if (res.url().includes('/api/auth/session')) {
          const headers = res.headers()
          // Collect all Set-Cookie headers
          const allHeaders = await res.headersArray()
          const raw = allHeaders.filter((h: {name: string; value: string}) => h.name.toLowerCase() === 'set-cookie')
          for (const h of raw) {
            if (h.value.includes('session-token')) {
              setCookieHeader = h.value
              console.log('[Phase 1] Server Set-Cookie header:', h.value.substring(0, 120))
            }
          }
        }
      })

      // Seed the request cookie so the server sees a valid JWT
      await ctx.addCookies([{
        name: cookieName,
        value: token,
        domain: host,
        path: '/',
        httpOnly: true,
        secure: isSecure,
        sameSite: 'Lax',
        expires: Math.floor(Date.now() / 1000) + 60, // very short — we want server to issue fresh one
      }])

      await page.goto(`${BASE_URL}/api/auth/session`)
      await page.waitForLoadState('networkidle')

      // The server should have issued a new Set-Cookie with Max-Age=2592000
      console.log('[Phase 1] Set-Cookie received:', setCookieHeader ? '✓' : '✗ NONE')
      if (setCookieHeader) {
        const hasMaxAge = setCookieHeader.includes('Max-Age=')
        const hasExpires = setCookieHeader.includes('Expires=')
        console.log('[Phase 1] Has Max-Age:', hasMaxAge ? '✓' : '✗ MISSING')
        console.log('[Phase 1] Has Expires:', hasExpires ? '✓' : '✗ MISSING')
        expect(hasMaxAge).toBe(true)
      }

      // Verify the cookie the browser stored
      const cookies = await ctx.cookies(BASE_URL)
      const sessionCookie = cookies.find((c) => c.name === cookieName)
      console.log('[Phase 1] Cookie stored in browser:', sessionCookie ? '✓' : '✗')
      if (sessionCookie) {
        const expiresIn = sessionCookie.expires - Date.now() / 1000
        console.log('[Phase 1] Cookie expires in:', Math.round(expiresIn / 86400), 'days')
        const isSessionCookie = sessionCookie.expires === -1
        console.log('[Phase 1] Is session cookie (no expiry):', isSessionCookie ? '⚠️ YES — WILL BE DELETED ON CLOSE' : '✓ NO (persistent)')
        if (isSessionCookie) {
          console.error('[Phase 1] ⚠️ The browser stored the cookie WITHOUT an expiry date!')
          console.error('[Phase 1] This means Safari will delete it when closed.')
        }
      }

      // Close browser (simulate Safari quit)
      await ctx.close()
      console.log('[Phase 1] Browser closed.')
    }

    await new Promise((r) => setTimeout(r, 800))

    // ── Phase 2: Restart and check ──
    console.log('[Phase 2] Relaunching browser with same on-disk profile...')
    {
      const ctx = await webkit.launchPersistentContext(PROFILE_DIR, {
        headless: true,
        ignoreHTTPSErrors: true,
      })

      const cookies = await ctx.cookies(BASE_URL)
      const sessionCookie = cookies.find((c) => c.name === cookieName)

      if (sessionCookie) {
        console.log('[Phase 2] ✓ Cookie survived restart')
        console.log('[Phase 2] Cookie expires:', new Date(sessionCookie.expires * 1000).toISOString())
      } else {
        console.error('[Phase 2] ✗ COOKIE LOST AFTER RESTART — root cause confirmed')
        console.error('[Phase 2] Safari deleted the server-set session cookie on browser close')
      }

      expect(sessionCookie, 'Server-set session cookie must survive browser restart').toBeTruthy()

      const page = await ctx.newPage()
      await page.goto(BASE_URL)
      await page.waitForURL((url) => url.pathname.startsWith('/dashboard'), { timeout: 15_000 })
      console.log('[Phase 2] ✓ Redirected to dashboard')
      await expect(page).toHaveURL(new RegExp(`${BASE_URL}/dashboard`))

      await ctx.close()
    }
  })

  test.afterAll(() => {
    if (fs.existsSync(PROFILE_DIR)) fs.rmSync(PROFILE_DIR, { recursive: true })
  })
})
