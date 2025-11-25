import { Executable } from 'src/shared/types'
import { Ellipsis } from 'lucide-react'

import { ExecutableBanner, ExecutableLogo } from '@renderer/components/Images'
import LaunchButton from '@renderer/components/LaunchButton'
import ExecutableDetailModule from '@renderer/components/ExecutableDetailModule'

type DetailViewProps = { executable: Executable | null; onEdit: () => void }

const DetailView = ({ executable, onEdit }: DetailViewProps) => {
  if (!executable) {
    return null
  }

  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#09090b] text-white scrollbar">
      <div className="absolute inset-0 h-[70vh] w-full">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]">
          <ExecutableBanner {...executable} />
        </div>

        <button
          className="absolute top-0 right-0 m-4 text-gray-400 hover:text-white z-20"
          onClick={() => onEdit()}
        >
          <Ellipsis />
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/60 to-transparent" />
        <div className="opacity-50"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-full justify-between">
        <div className="flex flex-1 flex-col justify-end p-8 lg:p-12">
          <div className="flex flex-col space-y-6">
            <div className="w-full max-w-md lg:max-w-xl max-ml-2">
              <ExecutableLogo {...executable} />

              <div className="mt-8 w-60 h-14">
                <LaunchButton executable={executable} />
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 pb-8 lg:px-12 lg:pb-12">
          <ExecutableDetailModule executable={executable} />
        </div>
      </div>
    </div>
  )
}

export default DetailView
