import { Executable } from 'src/shared/types'
import { Shapes } from 'lucide-react'

export function ExecutableIcon(executable: Executable) {
  if (executable.iconPath) {
    return (
      <div className={` ${!executable.executablePath ? 'opacity-60' : ''}`}>
        <img
          className="w-8 h-8 object-cover rounded-md flex-shrink-0"
          src={executable.iconPath}
          alt={`${executable.name} icon`}
        />
      </div>
    )
  } else {
    return (
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-selection rounded-md">
        <Shapes className="w-5 h-5 text-gray-400" />
      </div>
    )
  }
}

export function ExecutableBanner(executable: Executable) {
  if (executable.bannerPath) {
    return (
      <img
        src={executable.bannerPath}
        alt={`${executable.name} banner`}
        className="absolute inset-0 h-full w-full object-cover"
      />
    )
  } else {
    return (
      <div className="absolute inset-0 h-full w-full bg-selection flex items-center justify-center text-2xl">
        {executable.name}
      </div>
    )
  }
}

export function ExecutableLogo(executable: Executable) {
  if (executable.logoPath) {
    return (
      <img
        src={executable.logoPath}
        alt={`${executable.name} title`}
        className="object-contain object-left w-auto h-auto
             max-h-40 max-w-[20rem] 
             lg:max-h-56 lg:max-w-[28rem] 
             xl:max-h-64 xl:max-w-[36rem]"
      />
    )
  } else {
    return <h1 className="text-5xl font-bold tracking-tight">{executable.name}</h1>
  }
}
// GridImage is not here because it is isnt used as a component but as parameter for some complex 3D rendering shenadigans
