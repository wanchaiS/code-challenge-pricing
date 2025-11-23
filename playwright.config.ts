import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  testDir: path.join(__dirname, 'e2e'),
  timeout: 120_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: path.join(__dirname, 'api'),
      env: {
        NODE_ENV: 'test',
        PORT: '3000',
      },
      port: 3000,
      timeout: 120_000,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev -- --host --port 3001',
      cwd: path.join(__dirname, 'client'),
      port: 3001,
      timeout: 120_000,
      reuseExistingServer: true,
    },
  ],
})
