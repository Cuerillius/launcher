import { useEffect, useState } from 'react'
import { Executable } from 'src/shared/types'
import ExecutableView from './components/ExecutableView'
import SideBar from './components/Sidebar'

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
      <div className="w-64 border-r border-neutral-700 lg:w-96">
        <SideBar list={list} onSelect={setSelectedExecutable} />
      </div>
      <main className="flex-1">
        <ExecutableView executable={selectedExecutable} />
      </main>
    </div>
  )
}

export default App
