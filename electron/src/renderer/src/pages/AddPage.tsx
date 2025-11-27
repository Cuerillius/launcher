import { AppContextType } from '@renderer/Layout'
import { AddView } from '@renderer/views/AddView'
import { useOutletContext, useNavigate } from 'react-router-dom'

export default function AddPage() {
  const { refreshList } = useOutletContext<AppContextType>()
  const navigate = useNavigate()

  const handleDone = async (id: string) => {
    await refreshList()
    navigate(`/executable/${id}`)
  }

  const handleCancel = () => {
    navigate('/')
  }

  return <AddView onDone={handleDone} onCancel={handleCancel} />
}
