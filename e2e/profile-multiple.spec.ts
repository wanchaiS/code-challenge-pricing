import { expect, test } from '@playwright/test'

const apiBaseUrl = 'http://localhost:3000'

test.beforeEach(async ({ request }) => {
  await request.post(`${apiBaseUrl}/api/test/reset`)
})

test('create profile with multiple products, preview adjustments, and save', async ({
  page,
}) => {
  const profileName = 'Wholesale Multi Profile'

  // Navigate to profiles list and open creation form
  await page.goto('/profiles')
  await page.getByTestId('new-profile-button').click()
  await page.getByTestId('profile-name-input').fill(profileName)

  // Ensure selection type is multiple (default) and create the profile
  await page.getByTestId('selection-type-multiple').check()
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        res.url().includes('/api/pricing-profiles') &&
        res.status() === 201,
    ),
    page.getByTestId('create-profile-submit').click(),
  ])

  const profileCard = page
    .getByTestId('profile-card')
    .filter({ hasText: profileName })
  await expect(profileCard).toBeVisible()

  // Open setup page
  await profileCard.getByTestId('profile-setup-link').click()
  await page.waitForURL(/\/profiles\/.+/)
  await expect(page.getByRole('heading', { name: profileName })).toBeVisible()

  // Search and select two products
  await page.fill('#product-search', 'Koyama')
  const productOne = page.getByTestId('product-option-prod-2')
  const productTwo = page.getByTestId('product-option-prod-3')
  await expect(productOne).toBeVisible()
  await expect(productTwo).toBeVisible()
  await productOne.getByRole('checkbox').check()
  await productTwo.getByRole('checkbox').check()

  // Confirm rows appeared in the table
  await expect(
    page.getByRole('row', { name: /Koyama Methode Brut Nature NV/ }),
  ).toBeVisible()
  await expect(
    page.getByRole('row', { name: /Koyama Riesling 2018/ }),
  ).toBeVisible()

  // Switch to fixed adjustments and increases
  await page.getByText('Fixed ($)').click()
  await page.getByText('Increase +').click()

  // Edit adjustment values
  const adjustmentProd2 = page.getByTestId('adjustment-cell-prod-2')
  await adjustmentProd2.dblclick()
  const prod2Input = adjustmentProd2.getByRole('spinbutton')
  await prod2Input.fill('10')
  await prod2Input.press('Enter')

  const adjustmentProd3 = page.getByTestId('adjustment-cell-prod-3')
  await adjustmentProd3.dblclick()
  const prod3Input = adjustmentProd3.getByRole('spinbutton')
  await prod3Input.fill('5')
  await prod3Input.press('Enter')

  // Preview the new prices
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        res.url().includes('/api/pricing-profiles/') &&
        res.url().endsWith('/preview') &&
        res.status() === 200,
    ),
    page.getByTestId('refresh-preview-button').click(),
  ])

  await expect(
    page
      .getByRole('row', { name: /Koyama Methode Brut Nature NV/ })
      .getByText('$130'),
  ).toBeVisible()
  await expect(
    page
      .getByRole('row', { name: /Koyama Riesling 2018/ })
      .getByText('$220.04'),
  ).toBeVisible()

  // Save the draft
  await Promise.all([
    page.waitForResponse(
      (res) =>
        res.request().method() === 'PUT' &&
        res.url().includes('/api/pricing-profiles/') &&
        res.status() === 200,
    ),
    page.getByTestId('save-draft-button').click(),
  ])

  await expect(page.getByTestId('save-draft-button')).toBeEnabled()
})
