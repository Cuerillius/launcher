import { Executable } from 'src/shared/types'
import DomeGallery from './DomeGallery'
import GridView from './GridView'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface ExploreViewProps {
  executables: Executable[]
  onExecutableClick: (executable: Executable) => void
}

export default function ExploreView({ executables, onExecutableClick }: ExploreViewProps) {
  const [isGridView, setIsGridView] = useState(true)

  return (
    <div className="relative h-full w-full ">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setIsGridView(!isGridView)}
          className="px-3 py-2 rounded-full bg-mood hover:bg-selection transition-colors text-white border border-neutral-700"
          aria-label="Toggle view"
        >
          <motion.svg
            key="toggle-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-toggle-right"
            initial={false}
          >
            <motion.rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
            <motion.circle
              cx={isGridView ? 16 : 8}
              cy="12"
              r="2"
              transition={{ type: 'spring', stiffness: 700, damping: 30 }}
            />
          </motion.svg>
        </button>
      </div>

      {isGridView ? (
        <GridView executables={executables} onExecutableClick={onExecutableClick} />
      ) : (
        <div className="h-full w-full overflow-hidden">
          <DomeGallery executables={executables} />
        </div>
      )}
    </div>
  )
}
