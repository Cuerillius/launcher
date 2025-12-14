import { Executable } from "@/types/Executable";
import { Shapes } from "lucide-react";

export function ExecutableIcon({ executable }: { executable: Executable }) {
  if (executable.icon) {
    return (
      <div className={` ${!executable.path ? "opacity-60" : ""}`}>
        <img
          className="w-8 h-8 object-cover rounded-md"
          src={executable.icon.path}
          alt={`${executable.name} icon`}
        />
      </div>
    );
  } else {
    return (
      <div className="w-8 h-8 flex items-center justify-center bg-selection rounded-md">
        <Shapes className="w-5 h-5 text-gray-400" />
      </div>
    );
  }
}

export function ExecutableBanner(executable: Executable) {
  if (executable.banner) {
    return (
      <img
        src={executable.banner.path}
        alt={`${executable.name} banner`}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  } else {
    return (
      <div className="absolute inset-0 h-full w-full bg-selection flex items-center justify-center text-2xl"></div>
    );
  }
}

export function ExecutableLogo(executable: Executable) {
  if (executable.logo) {
    return (
      <img
        src={executable.logo.path}
        alt={`${executable.name} title`}
        className="object-contain object-left w-auto h-auto
             max-h-40 max-w-[20rem] 
             lg:max-h-56  
             xl:max-h-64"
      />
    );
  } else {
    return (
      <h1 className="text-5xl font-bold tracking-tight">{executable.name}</h1>
    );
  }
}

// grid image is not here because it needs special handling
