import "dotenv/config";
import fs from "fs";
import path from "path";
import { chromium, type BrowserContext, type Page } from "playwright";

const AUTH_STATE_PATH = path.resolve(".acuity-auth-state.json");
const DOWNLOAD_DIR = path.resolve("data");
const ERROR_SCREENSHOT_DIR = path.join(DOWNLOAD_DIR, "error-screenshots");
const CSV_FILENAME = "clients-export.csv";

const ACUITY_LOGIN_URL =
  "https://secure.acuityscheduling.com/login.php?ajax=0&popup=0&redirect=1";
const ACUITY_CLIENTS_URL =
  "https://secure.acuityscheduling.com/clients.php?action=importexport";

function getCredentials() {
  const email = process.env.ACUITY_EMAIL?.trim();
  const password = process.env.ACUITY_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error(
      "ACUITY_EMAIL and ACUITY_PASSWORD must be set in your .env file",
    );
  }

  return { email, password };
}

function getBackupCode(): string {
  const code = process.env.ACUITY_BACKUP_CODE;
  if (!code) {
    throw new Error(
      "2FA is required but ACUITY_BACKUP_CODE is not set in your .env file. " +
        "Generate a backup code from Acuity Scheduling and add it to .env.",
    );
  }
  return code;
}

function hasAuthState(): boolean {
  return fs.existsSync(AUTH_STATE_PATH);
}

async function captureErrorScreenshot(
  page: Page,
  step: string,
): Promise<string | null> {
  try {
    fs.mkdirSync(ERROR_SCREENSHOT_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const safeStep = step.replace(/[^a-zA-Z0-9-_]/g, "_");
    const screenshotPath = path.join(
      ERROR_SCREENSHOT_DIR,
      `${timestamp}-${safeStep}.png`,
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.error(`Error screenshot saved to ${screenshotPath}`);
    return screenshotPath;
  } catch (screenshotError) {
    console.error("Failed to capture error screenshot:", screenshotError);
    return null;
  }
}

async function rethrowWithScreenshot(
  page: Page,
  step: string,
  error: unknown,
): Promise<never> {
  const screenshotPath = await captureErrorScreenshot(page, step);
  if (screenshotPath && error instanceof Error) {
    error.message = `${error.message} (screenshot: ${screenshotPath})`;
  }
  throw error;
}

async function createContext() {
  const headless = process.env.PLAYWRIGHT_HEADLESS === "false" ? false : true;

  const browser = await chromium.launch({ headless });
  const contextOptions: Parameters<typeof browser.newContext>[0] = {
    acceptDownloads: true,
  };

  if (hasAuthState()) {
    contextOptions.storageState = AUTH_STATE_PATH;
  }

  const context = await browser.newContext(contextOptions);
  return { browser, context };
}

async function saveAuthState(context: BrowserContext) {
  const state = await context.storageState();
  fs.writeFileSync(AUTH_STATE_PATH, JSON.stringify(state, null, 2));
  console.log("Auth state saved for future sessions");
}

async function isLoggedIn(context: BrowserContext): Promise<boolean> {
  const page = await context.newPage();
  try {
    await page.goto(ACUITY_CLIENTS_URL, { waitUntil: "domcontentloaded" });

    const loggedOutDueToInactivity = (await page.content()).includes(
      "You have been automatically logged out after a period of inactivity",
    );

    const urlContainsLogin = page.url().includes("/login");

    return !loggedOutDueToInactivity && !urlContainsLogin;
  } catch (error) {
    return rethrowWithScreenshot(page, "is-logged-in", error);
  } finally {
    await page.close();
  }
}

async function submitSquarespaceLogin(page: Page, email: string, password: string) {
  console.log("Squarespace login page detected, submitting credentials...");

  const emailInput = page.locator(
    '[data-test="login-email-input"] input[name="email"], input[name="email"][type="email"]',
  );
  const passwordInput = page.locator('input[name="password"][type="password"]');
  const loginButton = page.locator('#login-button, [data-test="login-button"]');

  await emailInput.first().waitFor({ state: "visible", timeout: 15000 });
  await emailInput.first().fill(email);
  await passwordInput.first().click();
  await passwordInput.first().fill(password);

  // Squarespace keeps LOG IN disabled until React sees a password value.
  await loginButton.first().waitFor({ state: "visible", timeout: 10000 });
  await page.waitForFunction(() => {
    const button = document.querySelector<HTMLButtonElement>(
      "#login-button, [data-test='login-button']",
    );
    return !!button && !button.disabled;
  }, undefined, { timeout: 10000 });

  await loginButton.first().click();
}

async function submitAcuityPassword(page: Page, password: string) {
  console.log("Acuity password step detected, submitting password...");

  const passwordInput = page.locator(
    '#password, [data-testid="password-input"], input[name="password"][type="password"]',
  );
  const loginButton = page.locator('#next-button, [data-testid="next-button"]');

  await passwordInput.first().waitFor({ state: "visible", timeout: 10000 });
  await passwordInput.first().fill(password);
  await loginButton.first().click();
}

async function login(context: BrowserContext) {
  const { email, password } = getCredentials();
  const page = await context.newPage();

  try {
    console.log("Navigating to Acuity login...");
    await page.goto(ACUITY_LOGIN_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    // Acuity first step uses #username (name="username"), not name="email".
    const usernameInput = page.locator(
      '#username, [data-testid="username-input"], input[name="username"]',
    );
    const nextButton = page.locator('#next-button, [data-testid="next-button"]');
    const acuityPassword = page.locator(
      '#password-container #password, #password, [data-testid="password-input"]',
    );
    const acuityContinue = page.locator("#acuity-continue");
    const squarespaceLoginButton = page.locator(
      '#login-button, [data-test="login-button"]',
    );

    await usernameInput.first().waitFor({ state: "visible", timeout: 15000 });
    console.log("Entering email on Acuity login...");
    await usernameInput.first().fill(email);
    await nextButton.first().click();

    // After Next, login.js either:
    // 1) reveals Acuity password on the same page
    // 2) shows Acuity vs Squarespace chooser
    // 3) redirects to login.squarespace.com
    console.log("Waiting for password step or account chooser...");
    await Promise.race([
      acuityPassword.first().waitFor({ state: "visible", timeout: 30000 }),
      acuityContinue.waitFor({ state: "visible", timeout: 30000 }),
      squarespaceLoginButton.first().waitFor({ state: "visible", timeout: 30000 }),
    ]);

    if (await acuityContinue.isVisible().catch(() => false)) {
      // Env vars are Acuity credentials; prefer that path when both exist.
      console.log("Dual-account chooser detected, continuing with Acuity...");
      await acuityContinue.click();
      await acuityPassword.first().waitFor({ state: "visible", timeout: 10000 });
    }

    if (await squarespaceLoginButton.first().isVisible().catch(() => false)) {
      await submitSquarespaceLogin(page, email, password);
    } else {
      await submitAcuityPassword(page, password);
    }

    await page.waitForTimeout(3000);

    const url = page.url();
    const pageContent = await page.content();

    const needs2FA =
      url.includes("/authenticate") ||
      url.includes("/two-factor") ||
      url.includes("/2fa") ||
      pageContent.includes("backup code") ||
      pageContent.includes("two-factor") ||
      pageContent.includes("verification code") ||
      pageContent.includes("Two-Factor");

    if (needs2FA) {
      console.log("2FA required, using backup code...");
      await handle2FA(page);
    }

    await page.waitForTimeout(2000);

    const finalUrl = page.url();
    const finalContent = await page.content();
    const loginFailed =
      finalUrl.includes("login.squarespace.com") ||
      finalUrl.includes("secure.acuityscheduling.com/login") ||
      finalUrl.includes("/authenticate") ||
      finalContent.includes("username or password is incorrect");

    if (loginFailed) {
      throw new Error(
        `Login failed - still on auth page: ${finalUrl}. Check your credentials.`,
      );
    }

    console.log("Login successful");
    await saveAuthState(context);
  } catch (error) {
    await rethrowWithScreenshot(page, "login", error);
  } finally {
    await page.close();
  }
}

async function handle2FA(page: import("playwright").Page) {
  const backupCode = getBackupCode();

  // Look for a link/button to switch to backup code input
  console.log("Switching to backup code entry...");
  const useAnotherMethodLink = page.locator("text=/Use a different method/i");
  await useAnotherMethodLink.first().click();
  const backupCodeLink = page.locator("text=/Backup Code/i");
  await backupCodeLink.first().click();
  await page.waitForTimeout(1000);

  // Find the backup code input and fill it
  const codeInput = page.locator(
    'input[name="code"], input[name="backup_code"], input[name="backupCode"], input[type="text"], input[type="tel"]',
  );
  await codeInput.first().fill(backupCode);

  // Check "remember this device" if available
  const rememberCheckbox = page.locator(
    'input[type="checkbox"][name*="remember"], input[type="checkbox"][id*="remember"], label:has-text("remember") input[type="checkbox"]',
  );
  if ((await rememberCheckbox.count()) > 0) {
    const isChecked = await rememberCheckbox.first().isChecked();
    if (!isChecked) {
      await rememberCheckbox.first().check();
      console.log('Checked "remember this device"');
    }
  }

  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForTimeout(3000);
  console.log("2FA completed");
}

async function downloadExport(context: BrowserContext): Promise<string> {
  const page = await context.newPage();
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
  const csvPath = path.join(DOWNLOAD_DIR, CSV_FILENAME);

  try {
    console.log("Navigating to Clients page...");
    await page.goto(ACUITY_CLIENTS_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    console.log("Clicking Export Client List...");
    await page
      .locator(
        'a:has-text("Export Client List"), button:has-text("Export Client List")',
      )
      .first()
      .click();
    await page.waitForTimeout(2000);

    console.log("Clicking Export Clients to start download...");
    const [download] = await Promise.all([
      page.waitForEvent("download", { timeout: 30000 }),
      page
        .locator('input[type="submit"][value="Export Clients"]')
        .first()
        .click(),
    ]);

    console.log("Download started, saving file...");
    await download.saveAs(csvPath);
    console.log(`CSV downloaded to ${csvPath}`);

    return csvPath;
  } catch (error) {
    return rethrowWithScreenshot(page, "download-export", error);
  } finally {
    await page.close();
  }
}

export async function downloadClientList(): Promise<string> {
  const { browser, context } = await createContext();

  try {
    if (hasAuthState()) {
      const loggedIn = await isLoggedIn(context);
      if (!loggedIn) {
        console.log("Session expired, logging in...");
        await login(context);
      }
    } else {
      console.log("No saved session found, logging in...");
      await login(context);
    }

    return await downloadExport(context);
  } finally {
    await context.close();
    await browser.close();
  }
}
