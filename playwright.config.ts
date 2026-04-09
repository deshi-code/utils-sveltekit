// import { defineConfig } from '@playwright/test';

// export default defineConfig({
// 	webServer: { command: 'npm run build && npm run preview', port: 4173 },
// 	testMatch: '**/*.e2e.{ts,js}'
// });


import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    webServer: {
        command: 'npm run build && npm run preview',
        port: 4173,
        reuseExistingServer: !process.env.CI, // Don't rebuild locally if server is running
    },
    testMatch: '**/*.e2e.{ts,js}',
    use: {
        baseURL: 'http://localhost:4173',
        trace: 'on-first-retry',
    },
    // Optional: Run against multiple browsers
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    ],
});