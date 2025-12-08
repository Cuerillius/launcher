import { CircleQuestionMark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ImageSelect from "@/components/inputs/ImageSelect";
import { Executable } from "@/types/Executable";
import { SGDBGameImages } from "@/services/steamgriddb";

type ArtworkSectionProps = {
  formData: Executable;
  setFormData: React.Dispatch<React.SetStateAction<Executable>>;
  artwork: SGDBGameImages;
  hasApiKey: boolean;
  onOpenApiKeyDialog: () => void;
};

export function ArtworkSection({
  formData,
  setFormData,
  artwork,
  hasApiKey,
  onOpenApiKeyDialog,
}: ArtworkSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold">Artwork</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full -ml-1"
            onClick={onOpenApiKeyDialog}
            title="Configure API Key"
          >
            <CircleQuestionMark
              className={`w-4 h-4 ${
                !hasApiKey
                  ? "text-destructive animate-pulse"
                  : "text-muted-foreground"
              }`}
            />
          </Button>
        </div>
        <Separator className="mb-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
        <div className="space-y-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Grid Image
          </Label>
          <ImageSelect
            ratio="poster"
            images={artwork.grids}
            value={formData.grid}
            onChange={(id) => setFormData((prev) => ({ ...prev, grid: id }))}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Hero Banner
          </Label>
          <ImageSelect
            ratio="video"
            images={artwork.heroes}
            value={formData.banner}
            onChange={(id) => setFormData((prev) => ({ ...prev, banner: id }))}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Logo
          </Label>
          <ImageSelect
            ratio="logo"
            images={artwork.logos}
            value={formData.logo}
            onChange={(id) => setFormData((prev) => ({ ...prev, logo: id }))}
          />
        </div>

        <div className="space-y-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Icon
          </Label>
          <ImageSelect
            ratio="square"
            images={artwork.icons}
            value={formData.icon}
            onChange={(id) => setFormData((prev) => ({ ...prev, icon: id }))}
          />
        </div>
      </div>
    </div>
  );
}
