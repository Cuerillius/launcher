import { useState } from 'react'
import { Executable } from '../../../shared/types'

type EditExecutableProps = {
  onClose: () => void
  executable: Executable
}

function EditExecutable({ onClose, executable }: EditExecutableProps): React.JSX.Element {
  const [formState, setFormState] = useState<Omit<Executable, 'id'>>({
    name: executable.name,
    executablePath: executable.executablePath,
    description: executable.description,
    iconPath: executable.iconPath,
    bannerPath: executable.bannerPath,
    logoPath: executable.logoPath,
    gridPath: executable.gridPath
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target
    setFormState((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleFileSelect = async (
    field: 'executablePath' | 'iconPath' | 'bannerPath' | 'logoPath' | 'gridPath'
  ): Promise<void> => {
    const filePath = await window.fs.openFileDialog()

    if (filePath) {
      setFormState((prevState) => ({
        ...prevState,
        [field]: filePath
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!formState.name) {
      alert('Name is required.')
      return
    }
    await window.fs.save({
      id: executable.id,
      ...formState
    })
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleOverlayClick}
    >
      <div className="bg-mood text-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold mb-6">Edit Executable</h2>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formState.name}
              onChange={handleInputChange}
              required
              className="w-full bg-selection rounded border-none px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
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
                required
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              className="w-full bg-selection rounded border-none px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="space-y-4">
            {(
              [
                { key: 'iconPath', label: 'Icon' },
                { key: 'bannerPath', label: 'Banner' },
                { key: 'logoPath', label: 'Logo' },
                { key: 'gridPath', label: 'Grid' }
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label
                  htmlFor={key}
                  className="block text-sm font-medium text-gray-300 mb-1 capitalize"
                >
                  {label} Image
                </label>
                <div className="flex gap-2">
                  <input
                    id={key}
                    name={key}
                    type="text"
                    value={formState[key]}
                    readOnly
                    className="flex-grow bg-selection/70 rounded border-none px-3 py-2 text-sm"
                    placeholder="Select an image file..."
                  />
                  <button
                    type="button"
                    onClick={() => handleFileSelect(key)}
                    className="px-4 py-2 bg-selection rounded text-sm font-semibold hover:bg-selection/80"
                  >
                    Browse...
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-selection rounded font-semibold hover:bg-selection/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent text-black rounded font-semibold hover:brightness-90 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditExecutable
