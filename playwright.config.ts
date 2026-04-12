import { defineConfig, devices } from '@playwright/test';

const chromeDevice = devices['Desktop Chrome'];

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'on-first-retry',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: {
        ...chromeDevice,
        viewport: { width: 390, height: 844 }
      }
    },
    {
      name: 'tablet-chromium',
      use: {
        ...chromeDevice,
        viewport: { width: 834, height: 1112 }
      }
    },
    {
      name: 'desktop-chromium',
      use: {
        ...chromeDevice,
        viewport: { width: 1440, height: 1024 }
      }
    }
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true
  }
});
