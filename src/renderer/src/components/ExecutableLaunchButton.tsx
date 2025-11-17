import { CircleX, Play } from 'lucide-react'
import { Executable } from '../../../shared/types'
import { useEffect, useState } from 'react'

type ExecutableLaunchButtonProps = { executable: Executable | null }

function ExecutableLaunchButton({
  executable
}: ExecutableLaunchButtonProps): React.JSX.Element | null {
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    const handleExecutableStarted = () => {
      console.log('Received executable-started event. Updating UI.')
      setIsRunning(true)
    }

    const handleExecutableStopped = () => {
      console.log('Received executable-stopped event. Updating UI.')
      setIsRunning(false)
    }

    window.executable.onExecutableStarted(handleExecutableStarted)
    window.executable.onExecutableStopped(handleExecutableStopped)
    return () => {
      window.executable.removeListeners()
    }
  }, [])

  if (!executable) {
    return null
  }

  const handleLaunch = () => {
    if (executable.executablePath) {
      console.log(`Requesting to launch: ${executable.executablePath}`)
      window.executable.launch(executable.executablePath)
    }
  }

  const handleStop = () => {
    console.log('Requesting to stop the game.')
    window.executable.stop()
  }

  if (isRunning) {
    return (
      <button
        onClick={handleStop}
        className="flex shrink-0 items-center space-x-3 rounded-md bg-red-600 py-3 pl-8 pr-12 text-lg font-semibold text-white shadow-lg transition hover:brightness-90"
      >
        <CircleX />
        <span>Stop</span>
      </button>
    )
  }

  return executable.executablePath ? (
    <button
      onClick={handleLaunch}
      className="flex shrink-0 items-center space-x-3 rounded-md bg-accent py-3 pl-8 pr-12 text-lg font-semibold text-black shadow-lg transition hover:brightness-90"
    >
      <Play />
      <span>Launch</span>
    </button>
  ) : (
    <button
      className="flex shrink-0 cursor-not-allowed items-center space-x-3 rounded-md bg-selection py-3 pl-6 pr-8 text-lg font-semibold text-black shadow-lg transition"
      disabled
    >
      <span>Not Installed</span>
    </button>
  )
}

export default ExecutableLaunchButton
