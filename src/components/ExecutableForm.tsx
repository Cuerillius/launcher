import { useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen, Save, Search, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import NumberInput from "@/components/inputs/NumberInput";
import TagInput from "@/components/inputs/TagInput";
import ImageSelect from "@/components/inputs/ImageSelect";
import { DynamicComboBox } from "@/components/inputs/DynamicCombobox";
import { SelectEnum } from "@/components/inputs/SelectEnum";
import { Executable, SourcePlatform } from "@/types/Executable";
import {
  getGameImages,
  searchSteamGridDB,
  SGDBGame,
  SGDBGameImages,
} from "@/services/steamgriddb";
import { toast } from "sonner";
import {
  WarpDialog,
  WarpDialogContent,
  WarpDialogTrigger,
} from "@/components/ui/warp-dialog";
import WaveLoader from "@/components/display/Loading";
import { ScrollArea } from "./ui/scroll-area";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
type ExecutableFormProps = {
  initialData?: Executable;
  title: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (data: Executable) => Promise<void>;
  onDelete?: () => Promise<void>;
  autoSelectImages?: boolean;
};

export function ExecutableForm({
  initialData,
  title,
  submitLabel,
  onCancel,
  onSubmit,
  onDelete,
  autoSelectImages,
}: ExecutableFormProps) {
  const [formData, setFormData] = useState<Executable>(
    initialData || {
      id: crypto.randomUUID(),
      name: "",
      path: "",
      args: [],
      icon: "",
      logo: "",
      banner: "",
      grid: "",
      playtime: 0,
      platform: SourcePlatform.Unknown,
    }
  );
  const loadingStates = [
    "Getting ready",
    "Fetching artworks",
    "Downloading artworks",
    "Verifying integrity",
    "Saving to disk",
    "Cleaning up",
  ];

  const [games, setGames] = useState<SGDBGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<SGDBGame | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [artwork, setArtwork] = useState<SGDBGameImages>({
    grids: [],
    heroes: [],
    logos: [],
    icons: [],
  });

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const initializeArtwork = async () => {
      if (initialData?.name && !selectedGame?.id) {
        try {
          const games = await searchSteamGridDB(initialData.name);
          if (games.length > 0) {
            const images = await getGameImages(games[0].id);
            setArtwork(images);
            setSelectedGame(games[0]);
          }
        } catch (e) {
          console.error("Error fetching initial game details:", e);
        }
      }
    };
    initializeArtwork();
  }, [initialData, selectedGame]);

  useEffect(() => {
    if (selectedGame?.id) {
      getGameImages(selectedGame?.id).then((images) => {
        setArtwork(images);
      });

      if (autoSelectImages) {
        getGameImages(selectedGame.id).then((images) => {
          setFormData((prev) => ({
            ...prev,
            grid: images.grids[0]?.url || "",
            banner: images.heroes[0]?.url || "",
            logo: images.logos[0]?.url || "",
            icon: images.icons[0]?.url || "",
          }));
        });
      }
    }
  }, [selectedGame]);

  useEffect(() => {
    const fetchGames = async () => {
      if (!debouncedQuery.trim()) {
        setGames([]);
        return;
      }
      setLoading(true);
      try {
        const results = await searchSteamGridDB(debouncedQuery);
        setGames(results);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [debouncedQuery]);

  useEffect(() => {
    if (selectedGame) {
      setFormData((prev) => ({ ...prev, name: selectedGame.name }));
    }
  }, [selectedGame]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target;
    setFormData((prev) => ({
      ...prev,
      value,
    }));
  };

  const handleFileClick = async () => {
    try {
      const file = await open({
        multiple: false,
        directory: false,
        filters: [
          {
            name: "Executables",
            extensions: ["exe", "lnk", "bat", "cmd", "sh"],
          },
        ],
      });
      if (file) {
        setFormData((prev) => ({ ...prev, path: file }));
      }
    } catch (error) {
      console.error("Failed to open file dialog:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.info("Name is mandatory");
      return;
    }
    setSaving(true);
    await onSubmit(formData);
    setSaving(false);
  };

  return (
    <>
      <WaveLoader isVisible={saving} text="Saving..." />
      <ScrollArea className="h-full w-full">
        <WarpDialog>
          <WarpDialogContent>
            <h2 className="mb-6 text-2xl font-bold">
              Do you want to delete {formData.name}?
            </h2>
            <div className="flex justify-center gap-4">
              <WarpDialogTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </WarpDialogTrigger>
              <Button variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            </div>
          </WarpDialogContent>
          <div className="relative flex flex-col min-h-full w-full max-w-5xl mx-auto p-8 pb-0 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="space-y-10 flex-1">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Search className="w-4 h-4 text-primary" />
                      Game Details
                    </h2>
                    <Separator className="mb-6" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="col-span-full space-y-2">
                      <Label>Identify Game</Label>
                      <DynamicComboBox<SGDBGame>
                        items={games}
                        selectedItem={selectedGame}
                        isLoading={loading}
                        onSearch={setQuery}
                        onSelect={setSelectedGame}
                        getItemValue={(game) => game.id}
                        getItemLabel={(game) => game.name}
                        placeholder="Search SteamGridDB for metadata..."
                        emptyText="No games found."
                        className="w-full"
                      />
                    </div>

                    <div className="col-span-full space-y-2">
                      <Label htmlFor="exePath">Executable Path</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          name="path"
                          id="exePath"
                          placeholder="C:\Games\MyGame\game.exe"
                          value={formData.path}
                          onChange={handleChange}
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleFileClick}
                        >
                          <FolderOpen className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

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

                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <div className="[&>button]:w-full">
                        <SelectEnum
                          value={formData.platform || SourcePlatform.Unknown}
                          label="Platform"
                          placeholder="Select Platform"
                          enum={SourcePlatform}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              platform: value,
                            }))
                          }
                        />
                      </div>
                    </div>

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

                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Artwork</h2>
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
                        onChange={(id) =>
                          setFormData((prev) => ({ ...prev, grid: id }))
                        }
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
                        onChange={(id) =>
                          setFormData((prev) => ({ ...prev, banner: id }))
                        }
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
                        onChange={(id) =>
                          setFormData((prev) => ({ ...prev, logo: id }))
                        }
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
                        onChange={(id) =>
                          setFormData((prev) => ({ ...prev, icon: id }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

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
                  <>
                    <WarpDialogTrigger asChild>
                      <Button type="button" variant="destructive">
                        Delete
                      </Button>
                    </WarpDialogTrigger>
                  </>
                )}
                <Button type="submit" className="w-32">
                  <Save className="mr-2 h-4 w-4" />
                  {submitLabel}
                </Button>
              </div>
            </form>
          </div>
        </WarpDialog>
      </ScrollArea>
    </>
  );
}
