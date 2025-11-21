import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface SelectionDialogProps {
  open: boolean
  pendingLabel: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function SelectionDialog({
  open,
  pendingLabel,
  onConfirm,
  onCancel,
}: SelectionDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change selection scope?</DialogTitle>
          <DialogDescription>
            Switching to {pendingLabel ?? 'a different selection type'} resets
            the products and adjustments you’ve configured.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Continue
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
