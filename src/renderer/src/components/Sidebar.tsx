import { useState } from 'react'
import AddExecutable from './AddExecutable'
import { Executable } from '../../../shared/types'

type SideBarProps = {
  list: Executable[]
  onSelect: (executable: Executable) => void
}

function SideBar({ list, onSelect }: SideBarProps): React.JSX.Element {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [filterText, setFilterText] = useState('')

  const filteredList = list
    .filter((executable) => executable.name.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <aside className="w-full bg-mood text-white h-full flex flex-col p-4">
      <h4 className="text-xs font-bold tracking-wider text-gray-500 mb-4 uppercase">MY LIBRARY</h4>

      <input
        className="w-full px-3 py-2 bg-selection border-none rounded text-sm placeholder-gray-400 mb-4 focus:outline-none"
        placeholder="Filter library"
        aria-label="Filter library"
        onChange={(e) => setFilterText(e.target.value)}
      />
      <div className="flex-grow overflow-y-scroll scrollbar">
        <div className="relative">
          <ul className="space-y-1">
            {filteredList.map((executable) => (
              <li
                className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-selection cursor-pointer"
                key={executable.id}
                onClick={() => onSelect(executable)}
              >
                <img
                  className="w-6 h-6 object-contain rounded"
                  src={executable.iconPath}
                  alt={`${executable.name} icon`}
                />
                {executable.executablePath ? (
                  <span className="text-sm font-medium">{executable.name}</span>
                ) : (
                  <span className="text-sm font-medium text-gray-500">{executable.name}</span>
                )}
              </li>
            ))}
          </ul>
          <div
            className="sticky bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-mood to-transparent"
            style={{ pointerEvents: 'none' }}
          />
        </div>
      </div>

      <div className="p-2 mt-auto border-t border-gray-700">
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-white rounded text-sm hover:bg-selection"
          aria-label="Add executable"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span>Add Executable</span>
        </button>
      </div>
      {isAddDialogOpen && <AddExecutable onClose={() => setIsAddDialogOpen(false)} />}
    </aside>
  )
}

export default SideBar
