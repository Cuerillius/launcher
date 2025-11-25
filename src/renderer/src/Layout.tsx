import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Executable } from 'src/shared/types'
import SideBar from './components/Sidebar'

export type AppContextType = {
  executables: Executable[]
  refreshList: () => Promise<void>
}

export default function MainLayout() {
  const [list, setList] = useState<Executable[]>([])
  const navigate = useNavigate()

  const fetchExecutables = async (): Promise<void> => {
    const executables = await window.fs.getAll()
    setList(executables)
  }

  useEffect(() => {
    fetchExecutables()
  }, [])

  return (
    <div className="flex h-screen bg-mood">
      <SideBar
        list={list}
        onSelect={(exe) => navigate(exe ? `/executable/${exe.id}` : '/')}
        onAddClick={() => navigate('/add')}
        onExploreClick={() => navigate('/')}
      />
      <main className="flex-1 w-full overflow-auto">
        <Outlet context={{ executables: list, refreshList: fetchExecutables }} />
      </main>
    </div>
  )
}
