import { Search, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import NumberInput from "@/components/inputs/NumberInput";
import TagInput from "@/components/inputs/TagInput";
import { DynamicComboBox } from "@/components/inputs/DynamicCombobox";
import { SelectEnum } from "@/components/inputs/SelectEnum";
import { Executable, SourcePlatform } from "@/types/Executable";
import { SGDBGame } from "@/services/steamgriddb";

type GameDetailsSectionProps = {
  formData: Executable;
  setFormData: React.Dispatch<React.SetStateAction<Executable>>;
  games: SGDBGame[];
  selectedGame: SGDBGame | null;
  loading: boolean;
  hasApiKey: boolean;
  onSearchQuery: (query: string) => void;
  onSelectGame: (game: SGDBGame | null) => void;
  onFileClick: () => void;
  onHandleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function GameDetailsSection({
  formData,
  setFormData,
  games,
  selectedGame,
  loading,
  hasApiKey,
  onSearchQuery,
  onSelectGame,
  onFileClick,
  onHandleChange,
}: GameDetailsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          Game Details
        </h2>
        <Separator className="mb-6" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Identify Game */}
        <div className="col-span-full space-y-2">
          <Label>Identify Game</Label>
          <DynamicComboBox<SGDBGame>
            items={games}
            selectedItem={selectedGame}
            isLoading={loading}
            onSearch={onSearchQuery}
            onSelect={onSelectGame}
            getItemValue={(game) => game.id}
            getItemLabel={(game) => game.name}
            placeholder={
              hasApiKey
                ? "Search SteamGridDB for metadata..."
                : "API Key required for search"
            }
            emptyText="No games found."
            className="w-full"
          />
        </div>

        {/* Executable Path */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="exePath">Executable Path</Label>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              name="path"
              id="exePath"
              placeholder="C:\Games\MyGame\game.exe"
              value={formData.path}
              onChange={onHandleChange}
              className="font-mono text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onFileClick}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Args */}
        <div className="col-span-full space-y-2">
          <Label>Launch Arguments</Label>
          <TagInput
            value={formData.args || []}
            onChange={(newArgs) =>
              setFormData((prev) => ({ ...prev, args: newArgs }))
            }
            placeholder="Add arguments (e.g. -novid)..."
          />
        </div>

        {/* Platform */}
        <div className="space-y-2">
          <Label>Platform</Label>
          <div className="[&>button]:w-full">
            <SelectEnum
              value={formData.platform || SourcePlatform.Unknown}
              label="Platform"
              placeholder="Select Platform"
              enum={SourcePlatform}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, platform: value }))
              }
            />
          </div>
        </div>

        {/* Playtime */}
        <div className="space-y-2">
          <Label>Playtime (Minutes)</Label>
          <NumberInput
            value={formData.playtime || 0}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, playtime: value }))
            }
            step={10}
          />
        </div>
      </div>
    </div>
  );
}
