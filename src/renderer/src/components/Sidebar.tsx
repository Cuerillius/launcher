import { useState } from 'react'
import { Executable } from '../../../shared/types'
import { LayoutGrid, PanelLeftClose, Plus } from 'lucide-react'
import { ExecutableIcon } from './Images'

type SideBarProps = {
  list: Executable[]
  onSelect: (executable: Executable | null) => void
  onAddClick: () => void
  onExploreClick: () => void
}

function SideBar({ list, onSelect, onAddClick, onExploreClick }: SideBarProps): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const [filterText, setFilterText] = useState('')

  const filteredList = list
    .filter((executable) => executable.name.toLowerCase().includes(filterText.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <aside
      className={`border-r border-neutral-700 bg-mood text-white h-full flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-20 p-2' : 'w-64 p-4 lg:w-96'
      }`}
    >
      <div
        className={`flex items-center mb-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
      >
        {!isCollapsed && (
          <h4
            className={`text-xs font-bold tracking-wider text-gray-500 uppercase transition-opacity duration-300 ${
              isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}
          >
            My Library
          </h4>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white"
        >
          <PanelLeftClose
            className={`transition-transform duration-300 w-5 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
      <div className={`flex items-center gap-2 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
        {!isCollapsed && (
          <input
            className="flex-grow px-3 py-2 bg-selection border-none rounded text-sm placeholder-gray-400 focus:outline-none"
            placeholder="Filter library"
            aria-label="Filter library"
            onChange={(e) => setFilterText(e.target.value)}
          />
        )}
        <button
          onClick={() => onExploreClick()}
          className={`text-gray-400 hover:text-white flex-shrink-0 ${
            isCollapsed
              ? 'w-full h-12 flex items-center justify-center hover:bg-selection rounded'
              : 'p-1 rounded hover:bg-selection'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto scrollbar">
        <div className="relative">
          <ul className="space-y-1">
            {filteredList.map((executable) => (
              <li
                className={`flex items-center gap-3 pl-1 rounded hover:bg-selection cursor-pointer ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                key={executable.id}
                onClick={() => onSelect(executable)}
                title={executable.name}
              >
                <div
                  className={`flex items-center justify-center flex-shrink-0 ${
                    isCollapsed ? 'w-12 h-12' : 'w-10 h-10'
                  }`}
                >
                  <ExecutableIcon {...executable} />
                </div>
                {!isCollapsed && (
                  <span
                    className={`text-sm font-medium truncate ${
                      !executable.executablePath ? 'text-gray-500' : ''
                    }`}
                  >
                    {executable.name}
                  </span>
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

      <div className={`mt-auto border-t border-gray-700 pt-2`}>
        <button
          onClick={onAddClick}
          className={`w-full flex items-center gap-2 text-white rounded text-sm hover:bg-selection ${
            isCollapsed ? 'justify-center h-12' : 'px-3 py-2'
          }`}
          aria-label="Add executable"
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Add Executable</span>}
        </button>
      </div>
    </aside>
  )
}

export default SideBar
