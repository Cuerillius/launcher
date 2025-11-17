import { useEffect, useState } from 'react'
import { Executable } from 'src/shared/types'
import ExecutableView from './components/ExecutableView'
import SideBar from './components/Sidebar'
import ExploreView from './components/ExploreView'

function App(): React.JSX.Element {
  const [list, setList] = useState<Executable[]>([])
  const [selectedExecutable, setSelectedExecutable] = useState<Executable | null>(null)

  useEffect(() => {
    const fetchExecutables = async (): Promise<void> => {
      const executables = await window.fs.getAll()
      setList(executables)
    }
    fetchExecutables()
  }, [])

  return (
    <div className="flex h-screen bg-mood">
      <SideBar list={list} onSelect={setSelectedExecutable} />
      <main className="flex-1 w-full">
        {selectedExecutable !== null && <ExecutableView executable={selectedExecutable} />}
        {selectedExecutable === null && (
          <ExploreView executables={list} onExecutableClick={setSelectedExecutable} />
        )}
      </main>
    </div>
  )
}

export default App
