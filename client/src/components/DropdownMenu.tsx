import { ChevronDown } from 'lucide-react'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react'

interface DropdownContextValue {
  open: boolean
  setOpen: (next: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
  triggerWidth: number | null
}

const DropdownMenuContext = createContext<DropdownContextValue | null>(null)

export function DropdownMenu({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null!)
  const [triggerWidth, setTriggerWidth] = useState<number | null>(null)

  useEffect(() => {
    if (open && triggerRef.current) {
      setTriggerWidth(triggerRef.current.offsetWidth)
    }
  }, [open])

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen, triggerRef, triggerWidth }}
    >
      <div className={`relative inline-block text-left ${className}`}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger(
  props: ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const ctx = useDropdownContext()
  return (
    <button
      {...props}
      ref={ctx.triggerRef}
      type={props.type ?? 'button'}
      onClick={(event) => {
        props.onClick?.(event)
        if (!event.defaultPrevented) {
          ctx.setOpen(!ctx.open)
        }
      }}
      aria-haspopup="menu"
      aria-expanded={ctx.open}
    />
  )
}

export function DropdownMenuContent({
  children,
  className = '',
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const ctx = useDropdownContext()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!ctx.open) return
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        ctx.triggerRef.current &&
        !ctx.triggerRef.current.contains(event.target as Node)
      ) {
        ctx.setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        ctx.setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [ctx])

  if (!ctx.open) return null

  return (
    <div
      {...rest}
      ref={contentRef}
      role="menu"
      className={`absolute right-0 z-20 mt-2 rounded-xl border border-slate-200 bg-white p-1 shadow-xl ${className}`}
      style={{
        minWidth: ctx.triggerWidth ?? 220,
        width: ctx.triggerWidth ?? undefined,
      }}
    >
      {children}
    </div>
  )
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </p>
  )
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-slate-100" />
}

export function DropdownMenuItem({
  children,
  onSelect,
  active = false,
  className = '',
}: {
  children: ReactNode
  onSelect?: () => void
  active?: boolean
  className?: string
}) {
  const ctx = useDropdownContext()

  return (
    <button
      type="button"
      onClick={() => {
        onSelect?.()
        ctx.setOpen(false)
      }}
      className={`flex w-full items-center text-left justify-between rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 ${active ? 'bg-emerald-50 text-emerald-700' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export interface DropdownOption {
  label: string
  value: string
}

interface DropdownSelectProps {
  label: string
  placeholder?: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  allowClear?: boolean
  hasLabel?: boolean
}

export function DropdownSelect({
  label,
  placeholder = label,
  value,
  options,
  onChange,
  disabled,
  className = '',
  allowClear,
  hasLabel = false,
}: DropdownSelectProps) {
  const activeOption = options.find((option) => option.value === value) ?? null
  const labelId = useId()

  return (
    <div className={`flex flex-col gap-1 text-sm ${className}`}>
      {hasLabel && (
        <span id={labelId} className="block text-slate-600">
          {label}
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-labelledby={labelId}
          disabled={disabled}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-slate-50"
        >
          <span className="truncate">
            {activeOption ? activeOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {allowClear && (
            <>
              <DropdownMenuItem onSelect={() => onChange('')} active={!value}>
                None
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => onChange(option.value)}
              active={value === option.value}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function useDropdownContext(): DropdownContextValue {
  const ctx = useContext(DropdownMenuContext)
  if (!ctx) {
    throw new Error('Dropdown components must be used within <DropdownMenu>')
  }
  return ctx
}
