interface RadioGroupProps<T extends string> {
  label: string
  options: { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
}

export function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <div>
      <p className="text-xs  tracking-wide text-slate-500">{label}</p>
      <div className="mt-3 flex items-center gap-5 text-sm font-semibold text-slate-600">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                value === option.value
                  ? 'border-emerald-600'
                  : 'border-slate-300'
              }`}
            >
              {value === option.value && (
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
              )}
            </span>
            <input
              type="radio"
              className="sr-only"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
}
