import { CircleQuestionMark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Executable } from "@/types/Executable";
import ArtworkSelect from "./ArtworkSelect";
import { ArtworkRatio, ArtworkSet } from "@/types/Artwork";

type ArtworkSectionProps = {
  formData: Executable;
  setFormData: React.Dispatch<React.SetStateAction<Executable>>;
  artwork: ArtworkSet;
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
    <div>
      <div className="flex-none">
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

      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            Hero Banner
          </Label>
          <ArtworkSelect
            ratio={ArtworkRatio.Video}
            selectableImages={artwork.heroes}
            value={formData.banner?.source}
            onChange={(artworkResource) =>
              setFormData((prev) => ({
                ...prev,
                banner: {
                  path: artworkResource.path,
                  source: artworkResource,
                },
              }))
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-6 items-start">
          <div className="space-y-3">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
              Grid Image
            </Label>
            <ArtworkSelect
              ratio={ArtworkRatio.Poster}
              selectableImages={artwork.grids}
              value={formData.grid?.source}
              onChange={(artworkResource) =>
                setFormData((prev) => ({
                  ...prev,
                  grid: { path: artworkResource.path, source: artworkResource },
                }))
              }
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                Icon
              </Label>
              <ArtworkSelect
                ratio={ArtworkRatio.Square}
                selectableImages={artwork.icons}
                value={formData.icon?.source}
                onChange={(artworkResource) =>
                  setFormData((prev) => ({
                    ...prev,
                    icon: {
                      path: artworkResource.path,
                      source: artworkResource,
                    },
                  }))
                }
              />
            </div>

            <div className="space-y-3">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                Logo
              </Label>
              <ArtworkSelect
                ratio={ArtworkRatio.Logo}
                selectableImages={artwork.logos}
                value={formData.logo?.source}
                onChange={(artworkResource) =>
                  setFormData((prev) => ({
                    ...prev,
                    logo: {
                      path: artworkResource.path,
                      source: artworkResource,
                    },
                  }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
