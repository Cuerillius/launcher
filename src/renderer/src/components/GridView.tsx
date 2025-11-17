import { Executable } from 'src/shared/types'
import TiltedCard from './TiltedCard'

interface GridViewProps {
  executables: Executable[]
  onExecutableClick: (executable: Executable) => void
}

export default function GridView({ executables, onExecutableClick }: GridViewProps) {
  return (
    <div className="h-full w-full overflow-y-auto scrollbar">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
        {executables.map((executable) => (
          <div
            key={executable.id}
            onClick={() => onExecutableClick(executable)}
            className="group relative aspect-[2/3] w-full cursor-pointer"
          >
            <div className="relative h-full w-full">
              <TiltedCard
                imageSrc={executable.gridPath}
                altText={executable.name}
                containerHeight="100%"
                containerWidth="100%"
                imageHeight="100%"
                imageWidth="100%"
                captionText={executable.name}
                scaleOnHover={1.1}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={false}
                rotateAmplitude={15}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
