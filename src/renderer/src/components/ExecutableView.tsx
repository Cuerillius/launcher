import { Executable } from '../../../shared/types'

type ExecutableViewProps = { executable: Executable | null }

function ExecutableView({ executable }: ExecutableViewProps): React.JSX.Element | null {
  if (!executable) {
    return null
  }

  return (
    <div className="relative h-full w-full overflow-y-auto bg-mood text-white scrollbar">
      {/* Banner Image and Gradient */}
      <div className="relative h-80 w-full lg:h-96 xl:h-[32rem]">
        <img
          src={executable.bannerPath}
          alt={`${executable.name} banner`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-mood via-mood/80 to-transparent" />

        {/* Content over banner */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-6">
          {executable.logoPath ? (
            <img
              src={executable.logoPath}
              alt={`${executable.name} title`}
              className="max-h-24 object-contain"
            />
          ) : (
            <h1 className="text-5xl font-bold tracking-tight">{executable.name}</h1>
          )}
          {executable.executablePath ? (
            <button
              onClick={() => {
                if (executable.executablePath) {
                  window.executable.launch(executable.executablePath)
                }
              }}
              className="flex shrink-0 items-center space-x-3 rounded-md bg-accent py-3 pl-8 pr-12 text-lg font-semibold text-black shadow-lg transition hover:brightness-90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z"
                  clipRule="evenodd"
                />
              </svg>

              <span>Launch</span>
            </button>
          ) : (
            <button className="flex shrink-0 items-center space-x-3 rounded-md bg-selection py-3 pl-6 pr-8 text-lg font-semibold text-black shadow-lg transition discabled">
              <span>Not Installed</span>
            </button>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="p-6">
        <p className="text-gray-300">{executable.description || 'No description available.'}</p>
      </div>
    </div>
  )
}

export default ExecutableView
