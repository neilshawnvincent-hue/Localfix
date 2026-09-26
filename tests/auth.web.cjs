const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const { chromium } = require('playwright');

async function checkAuth(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  let deliveryFails = true;
  const userId = '00000000-0000-4000-8000-000000000001';
  page.on('pageerror', error => errors.push(error.message));
  await page.clock.install();
  await page.route('**/auth/v1/**', async route => {
    const url = new URL(route.request().url());
    const body = route.request().postDataJSON();
    requests.push({ path: url.pathname, body });
    if (url.pathname.endsWith('/otp')) {
      await route.fulfill({ status: deliveryFails ? 400 : 200, json: deliveryFails ? { msg: 'SMS provider unavailable' } : {} });
    } else if (url.pathname.endsWith('/verify')) {
      if (body.token !== '123456') {
        await route.fulfill({ status: 403, json: { msg: 'OTP is invalid or expired', code: 'otp_expired' } });
        return;
      }
      const expiresAt = Math.floor(Date.now() / 1000) + 3600;
      const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
      await route.fulfill({ json: {
        access_token: `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: userId, exp: expiresAt, role: 'authenticated' })}.test-signature`,
        token_type: 'bearer', expires_in: 3600, expires_at: expiresAt, refresh_token: 'test-only-refresh-token',
        user: { id: userId, aud: 'authenticated', phone: '919876543210', phone_confirmed_at: new Date().toISOString(), app_metadata: { provider: 'phone' }, user_metadata: {}, created_at: new Date().toISOString() },
      } });
    } else {
      await route.fulfill({ json: {} });
    }
  });
  await page.route('**/rest/v1/**', route => route.fulfill({ json: route.request().url().includes('/profiles')
    ? { id: userId, name: 'OTP Test Worker', role: 'worker', verification: 'unverified' }
    : [] }));
  await page.routeWebSocket(/supabase/, socket => socket.close());
  try {
    await page.goto('http://localhost:3000');
    const mobile = page.getByRole('textbox', { name: 'Mobile number (+91)', exact: true });
    const send = page.getByRole('button', { name: 'Send OTP', exact: true });
    await mobile.waitFor();
    assert.equal(await page.getByRole('textbox').count(), 1);
    await send.click();
    await page.getByText('Enter a valid 10-digit Indian mobile number.', { exact: true }).waitFor();
    assert.equal(requests.length, 0);
    await mobile.fill('9876543210');
    await send.click();
    await page.getByText('SMS provider unavailable', { exact: true }).waitFor();
    deliveryFails = false;
    await send.click();
    const otp = page.getByRole('textbox', { name: 'SMS OTP', exact: true });
    await otp.waitFor();
    const request = requests.findLast(entry => entry.path.endsWith('/otp')).body;
    assert.equal(request.phone, '+919876543210');
    assert.equal(request.channel, 'sms');
    assert.equal(request.create_user, false);
    assert.equal('email' in request, false);
    assert.equal('password' in request, false);
    assert.equal(await page.getByRole('button', { name: /Resend OTP in/ }).isDisabled(), true);
    const verify = page.getByRole('button', { name: 'Verify OTP & continue', exact: true });
    assert.equal(await verify.isDisabled(), true);
    await otp.fill('000000');
    await verify.click();
    await page.getByText('OTP is invalid or expired', { exact: true }).waitFor();
    assert.equal(await otp.isVisible(), true);
    await page.clock.fastForward(61000);
    await page.getByRole('button', { name: 'Resend OTP', exact: true }).click();
    await page.getByText('OTP sent by SMS.', { exact: true }).waitFor();
    assert.equal(await otp.inputValue(), '');
    await page.screenshot({ path: `/tmp/localfix-otp-${viewport.width}.png`, fullPage: true });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.getByRole('button', { name: 'Change mobile number', exact: true }).click();
    await mobile.waitFor();
    assert.equal(await otp.count(), 0);
    await page.getByRole('button', { name: 'Create an account', exact: true }).click();
    await page.getByRole('textbox', { name: 'Full name', exact: true }).fill('OTP Test Worker');
    await page.getByRole('radio', { name: 'Offer services', exact: true }).click();
    await mobile.fill('+91 98765 43210');
    await page.clock.fastForward(61000);
    await send.click();
    await otp.waitFor();
    const registration = requests.findLast(entry => entry.path.endsWith('/otp')).body;
    assert.equal(registration.create_user, true);
    assert.deepEqual(registration.data, { name: 'OTP Test Worker', role: 'worker' });
    await otp.fill('123456');
    await verify.click();
    await page.getByRole('textbox', { name: 'Aadhaar number', exact: true }).waitFor();
    assert.equal(await page.getByRole('heading', { name: 'A community built on trust.', exact: true }).isVisible(), true);
    await page.getByRole('button', { name: 'Back to sign in', exact: true }).click();
    await page.getByRole('button', { name: 'Demo customer', exact: true }).click();
    await page.getByRole('button', { name: 'My account', exact: true }).first().click();
    assert.equal(await page.getByRole('textbox', { name: 'Mobile number', exact: true }).inputValue(), 'Demo mobile');
    assert.doesNotMatch(await page.locator('body').innerText(), /email|password/i);
    assert.deepEqual(errors, []);
    console.log(`PASS ${viewport.width}px: mobile validation, delivery failure, SMS payload, invalid OTP, cooldown, resend, number change, signup role, verified session routing, mobile account display`);
  } finally {
    await context.close();
  }
}

async function main() {
  const browser = await chromium.launch();
  try {
    await checkAuth(browser, { width: 1440, height: 1000 });
    await checkAuth(browser, { width: 390, height: 844 });
  } finally {
    await browser.close();
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });