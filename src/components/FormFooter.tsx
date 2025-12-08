import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WarpDialogTrigger } from "@/components/ui/warp-dialog";

type FormFooterProps = {
  submitLabel: string;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
};

export function FormFooter({
  submitLabel,
  onCancel,
  onDelete,
}: FormFooterProps) {
  return (
    <div className="sticky bottom-0 -mx-8 px-8 py-3 bg-background/80 backdrop-blur-md border-t border-border flex justify-end gap-4 z-10 mt-auto">
      <Button
        type="button"
        variant="outline"
        className="w-32 hover:bg-destructive/10 hover:text-destructive"
        onClick={onCancel}
      >
        Cancel
      </Button>
      {onDelete && (
        <WarpDialogTrigger asChild>
          <Button type="button" variant="destructive">
            Delete
          </Button>
        </WarpDialogTrigger>
      )}
      <Button type="submit" className="w-32">
        <Save className="mr-2 h-4 w-4" />
        {submitLabel}
      </Button>
    </div>
  );
}
