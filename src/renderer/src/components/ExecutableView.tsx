import { Ellipsis } from 'lucide-react'
import { Executable } from '../../../shared/types'
import ExecutableLaunchButton from './ExecutableLaunchButton'
import { useState } from 'react'
import EditExecutable from './EditExecutable'
import { ExecutableBanner, ExecutableLogo } from './Images'

type ExecutableViewProps = { executable: Executable | null }

function ExecutableView({ executable }: ExecutableViewProps): React.JSX.Element | null {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  if (!executable) {
    return null
  }

  return (
    <div className="relative h-full w-full overflow-y-auto bg-mood text-white scrollbar">
      <div className="relative h-80 w-full lg:h-96 xl:h-[32rem]">
        <ExecutableBanner {...executable} />
        <div className="absolute inset-0 bg-gradient-to-t from-mood via-mood/80 to-transparent" />

        <button
          className="absolute top-0 right-0 m-4 text-gray-400 hover:text-white"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Ellipsis />
        </button>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-6">
          <ExecutableLogo {...executable} />
          <ExecutableLaunchButton executable={executable} />
        </div>
      </div>
      <div className="p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-300">{executable.description || 'No description available.'}</p>
        </div>
      </div>
      {isEditDialogOpen && (
        <EditExecutable executable={executable} onClose={() => setIsEditDialogOpen(false)} />
      )}
    </div>
  )
}

export default ExecutableView
