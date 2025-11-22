import type { PricingProfile } from '@/lib/api'
import type { AdjustmentType, IncrementType } from '@/lib/types'
import { DropdownSelect } from '../../components/DropdownMenu'
import { RadioGroup } from '../../components/RadioGroup'

interface BasedOnSectionProps {
  basedOnValue: string | null
  basedOnOptions: PricingProfile[]
  summary: string
  adjustmentType: AdjustmentType
  incrementType: IncrementType
  loadingProfiles: boolean
  onBasedOnChange: (profileId: string | null) => void
  onAdjustmentTypeChange: (type: AdjustmentType) => void
  onIncrementTypeChange: (type: IncrementType) => void
}

export function BasedOnSection({
  basedOnValue,
  basedOnOptions,
  summary,
  adjustmentType,
  incrementType,
  loadingProfiles,
  onBasedOnChange,
  onAdjustmentTypeChange,
  onIncrementTypeChange,
}: BasedOnSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5 shadow-sm">
      <div className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wide text-slate-500">
          Based on
        </label>
        <DropdownSelect
          className="w-full md:w-80"
          label="Based on profile"
          placeholder="Select profile"
          value={basedOnValue ?? ''}
          options={basedOnOptions.map((profile) => ({
            label: profile.name,
            value: profile._id,
          }))}
          onChange={(value) => onBasedOnChange(value || null)}
          allowClear
          disabled={loadingProfiles}
        />
      </div>

      <div className="mt-6 space-y-6">
        <RadioGroup
          label="Set Price Adjustment Mode"
          options={[
            { label: 'Fixed ($)', value: 'fixed' },
            { label: 'Dynamic (%)', value: 'dynamic' },
          ]}
          value={adjustmentType}
          onChange={(value) => onAdjustmentTypeChange(value as AdjustmentType)}
        />
        <RadioGroup
          label="Set Price Adjustment Increment Mode"
          options={[
            { label: 'Increase +', value: 'increase' },
            { label: 'Decrease -', value: 'decrease' },
          ]}
          value={incrementType}
          onChange={(value) => onIncrementTypeChange(value as IncrementType)}
        />
        <p className="flex items-center gap-2 text-xs text-amber-600">
          <span className="text-base leading-none">💡</span>
          {summary}
        </p>
      </div>
    </div>
  )
}
