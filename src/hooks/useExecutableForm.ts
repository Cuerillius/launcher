import { useState, useEffect } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { Executable, SourcePlatform } from "@/types/Executable";
import {
  getGameImages,
  searchSteamGridDB,
  SGDBGame,
  SGDBGameImages,
} from "@/services/steamgriddb";
import { toast } from "sonner";
import { isKeySet } from "@/services/keystore";

// Simple debounce implementation
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

type UseExecutableFormProps = {
  initialData?: Executable;
  onSubmit: (data: Executable) => Promise<void>;
  autoSelectImages?: boolean;
};

export function useExecutableForm({
  initialData,
  onSubmit,
  autoSelectImages,
}: UseExecutableFormProps) {
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

  const [games, setGames] = useState<SGDBGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<SGDBGame | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [artwork, setArtwork] = useState<SGDBGameImages>({
    grids: [],
    heroes: [],
    logos: [],
    icons: [],
  });

  const debouncedQuery = useDebounce(query, 500);

  // Check API Key
  useEffect(() => {
    const checkKey = async () => {
      const exists = await isKeySet();
      setHasApiKey(exists);
    };
    checkKey();
  }, []);

  // Initial Data Auto-fetch
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
  }, [initialData]);

  // Handle Game Selection
  useEffect(() => {
    if (selectedGame?.id) {
      // Update name if selected from dropdown
      setFormData((prev) => ({ ...prev, name: selectedGame.name }));

      getGameImages(selectedGame.id).then((images) => {
        setArtwork(images);

        if (autoSelectImages) {
          setFormData((prev) => ({
            ...prev,
            grid: images.grids[0]?.url || "",
            banner: images.heroes[0]?.url || "",
            logo: images.logos[0]?.url || "",
            icon: images.icons[0]?.url || "",
          }));
        }
      });
    }
  }, [selectedGame, autoSelectImages]);

  // Handle Search Query
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  return {
    formData,
    setFormData,
    games,
    selectedGame,
    setSelectedGame,
    setQuery,
    loading,
    saving,
    artwork,
    hasApiKey,
    setHasApiKey,
    handleChange,
    handleFileClick,
    handleSubmit,
  };
}
