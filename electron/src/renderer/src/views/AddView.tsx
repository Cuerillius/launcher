import ExecutableForm from '@renderer/components/ExecutableForm'
import { Executable } from 'src/shared/types'

type AddViewProps = {
  onDone: (id: string) => void
  onCancel: () => void
}

export function AddView({ onDone, onCancel }: AddViewProps) {
  const handleSubmit = async (data: Omit<Executable, 'id'>) => {
    const newId = crypto.randomUUID()
    await window.fs.save({ id: newId, ...data })
    onDone(newId)
  }

  return (
    <ExecutableForm
      title="Add New Executable"
      submitLabel="Add Executable"
      onCancel={onCancel}
      onSubmit={handleSubmit}
      autoSelectImages={true}
    />
  )
}
