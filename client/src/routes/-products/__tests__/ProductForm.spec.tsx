import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, vi } from 'vitest'
import { ProductForm, type ProductFormValues } from '../ProductForm'

const baseReferences = {
  brands: [{ _id: 'brand-1', name: 'Brand 1' }],
  categories: [
    { _id: 'cat-1', name: 'Category A' },
    { _id: 'cat-2', name: 'Category B' },
  ],
  subCategories: [
    { _id: 'sub-1', name: 'Sub A1', categoryId: 'cat-1' },
    { _id: 'sub-2', name: 'Sub B1', categoryId: 'cat-2' },
  ],
  segments: [{ _id: 'seg-1', name: 'Segment A' }],
  styles: [
    { _id: 'style-1', name: 'Style A', subCategoryId: 'sub-1' },
    { _id: 'style-2', name: 'Style B', subCategoryId: 'sub-2' },
  ],
}

function renderForm(
  props: Partial<{
    initialValues: Partial<ProductFormValues>
    onSubmit: (values: ProductFormValues) => Promise<void> | void
  }> = {},
) {
  const onSubmit = props.onSubmit ?? vi.fn()
  render(
    <ProductForm
      references={baseReferences}
      onSubmit={onSubmit}
      initialValues={props.initialValues}
    />,
  )
  return { onSubmit }
}

describe('ProductForm', () => {
  it('shows required error when submitting empty form', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /save product/i }))
    expect(
      await screen.findByText(/product name is required/i),
    ).toBeInTheDocument()
  })

  it('rejects negative wholesale price', async () => {
    renderForm()

    await userEvent.type(screen.getByLabelText(/product name/i), 'Test')
    await userEvent.type(screen.getByLabelText(/sku code/i), 'SKU1')
    await userEvent.type(
      screen.getByLabelText(/global wholesale price/i),
      '-5',
    )

    // Select Brand - click the button trigger, then click the option
    await userEvent.click(screen.getByRole('button', { name: /^brand$/i }))
    await userEvent.click(await screen.findByText('Brand 1'))

    // Select Category
    await userEvent.click(screen.getByRole('button', { name: /^category$/i }))
    await userEvent.click(await screen.findByText('Category A'))

    // Select Subcategory
    await userEvent.click(screen.getByRole('button', { name: /^subcategory$/i }))
    await userEvent.click(await screen.findByText('Sub A1'))

    // Select Segment
    await userEvent.click(screen.getByRole('button', { name: /^segment$/i }))
    await userEvent.click(await screen.findByText('Segment A'))

    await userEvent.click(screen.getByRole('button', { name: /save product/i }))
    expect(
      await screen.findByText(/wholesale price must be a valid non-negative number/i),
    ).toBeInTheDocument()
  })

  it('clears subcategory and style when category changes', async () => {
    renderForm({
      initialValues: {
        categoryId: 'cat-1',
        subCategoryId: 'sub-1',
        styleId: 'style-1',
      },
    })

    // Verify initial state - Sub A1 and Style A should be selected
    expect(screen.getByText('Sub A1')).toBeInTheDocument()
    expect(screen.getByText('Style A')).toBeInTheDocument()

    // Switch to Category B
    await userEvent.click(screen.getByRole('button', { name: /^category$/i }))
    await userEvent.click(await screen.findByText('Category B'))

    // Subcategory should be reset to placeholder
    expect(screen.getByText('Select subcategory')).toBeInTheDocument()
    expect(screen.queryByText('Sub A1')).not.toBeInTheDocument()

    // Style should be reset to placeholder
    expect(screen.getByText('Select a subcategory first')).toBeInTheDocument()
    expect(screen.queryByText('Style A')).not.toBeInTheDocument()

    // Open subcategory dropdown to verify Sub A1 is not in the filtered list
    await userEvent.click(screen.getByRole('button', { name: /^subcategory$/i }))
    expect(screen.queryByText('Sub A1')).not.toBeInTheDocument()
    expect(screen.getByText('Sub B1')).toBeInTheDocument()
  })
})
