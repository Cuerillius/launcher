import { useState, useEffect, useRef } from 'react'
import { Executable, SourcePlatform } from '../../../shared/types'

import SGDB, { SGDBImage } from 'steamgriddb'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

function ImageSelector({
  label,
  images,
  selectedUrl,
  onSelect,
  onCustomUpload
}: {
  label: string
  images: { url: string; thumb: string }[]
  selectedUrl: string
  onSelect: (url: string) => void
  onCustomUpload: () => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">{label}</label>
      <div className="flex items-center gap-4">
        <div className="flex-grow bg-selection/30 p-2 rounded-lg overflow-x-auto flex gap-3 min-h-[100px] scrollbar">
          {images.map((img) => (
            <img
              key={img.url}
              src={img.thumb}
              onClick={() => onSelect(img.url)}
              className={`h-24 object-contain rounded-md cursor-pointer transition-all ${
                selectedUrl === img.url ? 'ring-2 ring-accent' : 'opacity-60 hover:opacity-100'
              }`}
              alt={`${label} option`}
            />
          ))}
          {images.length === 0 && (
            <div className="flex items-center justify-center w-full text-gray-400 text-sm">
              No images found.
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onCustomUpload}
          className="px-4 py-2 bg-selection rounded text-sm font-semibold hover:bg-selection/80 self-center"
        >
          Upload...
        </button>
      </div>
    </div>
  )
}

type ExecutableFormProps = {
  initialData?: Executable
  title: string
  submitLabel: string
  onCancel: () => void
  onSubmit: (data: Omit<Executable, 'id'> | Executable) => Promise<void>
  onDelete?: () => Promise<void>
  autoSelectImages?: boolean
}

function ExecutableForm({
  initialData,
  title,
  submitLabel,
  onCancel,
  onSubmit,
  onDelete,
  autoSelectImages = false
}: ExecutableFormProps) {
  const [formState, setFormState] = useState<Omit<Executable, 'id'> | Executable>(
    initialData || {
      name: '',
      executablePath: '',
      iconPath: '',
      bannerPath: '',
      logoPath: '',
      gridPath: '',
      platform: SourcePlatform.Unknown,
      playtime: 0
    }
  )

  const [searchQuery, setSearchQuery] = useState(initialData?.name || '')
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [client, setClient] = useState<SGDB | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null)
  const searchEnabled = useRef(!initialData)

  const [artwork, setArtwork] = useState<{
    grids: { url: string; thumb: string }[]
    heroes: { url: string; thumb: string }[]
    logos: { url: string; thumb: string }[]
    icons: { url: string; thumb: string }[]
  }>({
    grids: [],
    heroes: [],
    logos: [],
    icons: []
  })

  useEffect(() => {
    if (window.executable) {
      window.executable.getSettings().then((settings: any) => {
        if (settings.STEAMGRIDDB_API_KEY) {
          setClient(
            new SGDB({
              key: settings.STEAMGRIDDB_API_KEY,
              baseURL: 'https://www.steamgriddb.com/api/v2'
            })
          )
        }
      })
    }
  }, [])

  useEffect(() => {
    const initializeArtwork = async () => {
      if (client && initialData?.name && !selectedGameId) {
        try {
          const games = await client.searchGame(initialData.name)
          if (games.length > 0) {
            setSelectedGameId(games[0].id)
          }
        } catch (e) {
          console.error('Error fetching initial game details:', e)
        }
      }
    }
    initializeArtwork()
  }, [client, initialData, selectedGameId])

  useEffect(() => {
    const searchGames = async () => {
      if (!client || debouncedSearch.length < 3 || !searchEnabled.current) {
        setSearchResults([])
        return
      }
      const games = await client.searchGame(debouncedSearch)
      setSearchResults(games)
    }
    searchGames()
  }, [debouncedSearch, client])

  useEffect(() => {
    const fetchArtwork = async () => {
      if (!client || !selectedGameId) return

      const [grids, heroes, logos, icons] = await Promise.all([
        client.getGrids({ type: 'game', id: selectedGameId }),
        client.getHeroes({ type: 'game', id: selectedGameId }),
        client.getLogos({ type: 'game', id: selectedGameId }),
        client.getIcons({ type: 'game', id: selectedGameId })
      ])

      const mapImages = (images: SGDBImage[]) =>
        images.map((img) => ({ url: img.url.toString(), thumb: img.thumb.toString() }))

      setArtwork({
        grids: mapImages(grids),
        heroes: mapImages(heroes),
        logos: mapImages(logos),
        icons: mapImages(icons)
      })

      if (autoSelectImages) {
        setFormState((prev) => ({
          ...prev,
          bannerPath: heroes[0]?.url.toString() || '',
          gridPath: grids[0]?.url.toString() || '',
          logoPath: logos[0]?.url.toString() || '',
          iconPath: icons[0]?.url.toString() || ''
        }))
      }
    }
    fetchArtwork()
  }, [selectedGameId, client, autoSelectImages])

  const handleSearchResultSelect = (result: any) => {
    searchEnabled.current = false
    setSearchQuery(result.name)
    setFormState((prev) => ({ ...prev, name: result.name }))
    setSelectedGameId(result.id)
    setSearchResults([])
  }

  const handleFileSelect = async (
    field: 'executablePath' | 'iconPath' | 'bannerPath' | 'logoPath' | 'gridPath'
  ) => {
    if (!window.fs) return
    const filePath = await window.fs.openFileDialog()
    if (filePath) {
      setFormState((prevState) => ({ ...prevState, [field]: filePath }))
    }
  }

  const handleImageSelect = (
    field: 'bannerPath' | 'gridPath' | 'logoPath' | 'iconPath',
    url: string
  ) => {
    setFormState((prevState) => ({ ...prevState, [field]: url }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({
      ...prev,
      [name]: name === 'playtime' ? Number(value) : value
    }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    searchEnabled.current = true
    setSearchQuery(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name) {
      alert('Name is required.')
      return
    }
    await onSubmit(formState)
  }

  return (
    <div className="w-full h-full flex flex-col text-white bg-background">
      <div className="p-6 flex-shrink-0 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-4">
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-6 py-2 bg-red-600 rounded font-semibold hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-selection rounded font-semibold hover:bg-selection/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="executable-form"
            className="px-6 py-2 bg-accent text-black rounded font-semibold hover:brightness-90 transition"
          >
            {submitLabel}
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        <form
          id="executable-form"
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8"
        >
          <div className="space-y-6 bg-mood p-6 rounded-lg h-fit">
            <h2 className="font-semibold text-lg border-b border-gray-600 pb-2 mb-4">
              Core Details
            </h2>

            <div className="relative">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Start typing to search..."
                className="w-full bg-selection rounded border-none px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
              {searchResults.length > 0 && (
                <ul className="absolute z-10 w-full bg-mood border border-gray-600 mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result) => (
                    <li
                      key={result.id}
                      onClick={() => handleSearchResultSelect(result)}
                      className="px-4 py-2 hover:bg-selection cursor-pointer"
                    >
                      {result.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <label htmlFor="path" className="block text-sm font-medium text-gray-300 mb-1">
                Executable Path
              </label>
              <div className="flex gap-2">
                <input
                  id="path"
                  name="executablePath"
                  type="text"
                  value={formState.executablePath}
                  readOnly
                  className="flex-grow bg-selection/70 rounded border-none px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleFileSelect('executablePath')}
                  className="px-4 py-2 bg-selection rounded text-sm font-semibold hover:bg-selection/80"
                >
                  Browse...
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-1">
                Source
              </label>
              <select
                id="platform"
                name="platform"
                value={formState.platform}
                onChange={handleInputChange}
                className="w-full bg-selection rounded border-none px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent capitalize cursor-pointer"
              >
                {Object.values(SourcePlatform).map((src) => (
                  <option key={src} value={src} className="bg-background text-white">
                    {src}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="playtime" className="block text-sm font-medium text-gray-300 mb-1">
                Playtime <span className="text-gray-500 font-normal">(minutes)</span>
              </label>
              <input
                id="playtime"
                name="playtime"
                type="number"
                min="0"
                value={formState.playtime || 0}
                onChange={handleInputChange}
                className="w-full bg-selection rounded border-none px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="space-y-6 bg-mood p-6 rounded-lg">
            <h2 className="font-semibold text-lg border-b border-gray-600 pb-2 mb-4">Artwork</h2>
            {selectedGameId || !autoSelectImages ? (
              <div className="space-y-6">
                <ImageSelector
                  label="Banner (Hero)"
                  images={artwork.heroes}
                  selectedUrl={formState.bannerPath || ''}
                  onSelect={(url) => handleImageSelect('bannerPath', url)}
                  onCustomUpload={() => handleFileSelect('bannerPath')}
                />
                <ImageSelector
                  label="Grid"
                  images={artwork.grids}
                  selectedUrl={formState.gridPath || ''}
                  onSelect={(url) => handleImageSelect('gridPath', url)}
                  onCustomUpload={() => handleFileSelect('gridPath')}
                />
                <ImageSelector
                  label="Logo"
                  images={artwork.logos}
                  selectedUrl={formState.logoPath || ''}
                  onSelect={(url) => handleImageSelect('logoPath', url)}
                  onCustomUpload={() => handleFileSelect('logoPath')}
                />
                <ImageSelector
                  label="Icon"
                  images={artwork.icons}
                  selectedUrl={formState.iconPath || ''}
                  onSelect={(url) => handleImageSelect('iconPath', url)}
                  onCustomUpload={() => handleFileSelect('iconPath')}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="mt-4 p-4 bg-selection/20 rounded text-sm text-gray-400 text-center">
                  Search for the name above to load new artwork suggestions from SteamGridDB.
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ExecutableForm
