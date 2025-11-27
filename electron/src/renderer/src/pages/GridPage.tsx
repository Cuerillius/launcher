import { AppContextType } from '@renderer/Layout'
import GridView from '@renderer/views/GridView'
import { useNavigate, useOutletContext } from 'react-router-dom'

export default function GridPage() {
  const { executables } = useOutletContext<AppContextType>()
  const navigate = useNavigate()
  const handleExecutableDetailClick = (id: string) => {
    navigate(`/executable/${id}`)
  }

  return (
    <GridView executables={executables} onExecutableDetailClick={handleExecutableDetailClick} />
  )
}
