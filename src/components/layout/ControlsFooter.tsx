import { Save, Trash2, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WarpDialogTrigger } from "@/components/ui/warp-dialog";

type ControlsFooterProps = {
  submitLabel?: string;
  submitIcon?: LucideIcon;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
  onSubmit?: () => void;
  isSubmitting?: boolean;
};

export function ControlsFooter({
  submitLabel = "Save",
  submitIcon: Icon = Save,
  onCancel,
  onDelete,
  onSubmit,
  isSubmitting,
}: ControlsFooterProps) {
  return (
    <div className="sticky bottom-0 -mx-8 px-8 py-4 bg-background/80 backdrop-blur-md border-t border-border flex justify-end gap-4 mt-auto z-20">
      <Button
        type="button"
        variant="outline"
        className="w-32 hover:bg-destructive/10 hover:text-destructive transition-colors"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>

      {onDelete && (
        <WarpDialogTrigger asChild>
          <Button type="button" variant="destructive" disabled={isSubmitting}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </WarpDialogTrigger>
      )}

      <Button
        type={onSubmit ? "button" : "submit"}
        onClick={onSubmit}
        className="min-w-32"
        disabled={isSubmitting}
      >
        <Icon className="mr-2 h-4 w-4" />
        {submitLabel}
      </Button>
    </div>
  );
}
