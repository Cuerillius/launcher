import {
  getRunningExecutables,
  launchExecutable,
  stopExecutable,
} from "@/services/executables";
import { Executable } from "@/types/Executable";
import { CircleX, Ellipsis, Play, LucideIcon } from "lucide-react";

import { useEffect, useState, useMemo, useCallback } from "react";

function useExecutableStatus(executable: Executable | null) {
  const [isRunning, setIsRunning] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!executable) return;

    try {
      const runningIds = await getRunningExecutables();
      const isThisGameRunning = runningIds.includes(executable.id);

      setIsRunning(isThisGameRunning);
    } catch (error) {
      console.error("Failed to check game status:", error);
    }
  }, [executable]);

  useEffect(() => {
    if (!executable) return;
    checkStatus();
    const intervalId = setInterval(checkStatus, 2000);
    return () => {
      clearInterval(intervalId);
    };
  }, [executable, checkStatus]);

  const handleLaunch = async () => {
    if (executable) {
      try {
        setIsRunning(true);
        await launchExecutable(executable.id);
        checkStatus();
      } catch (error) {
        console.error("Failed to launch:", error);
        setIsRunning(false);
      }
    }
  };

  const handleStop = async () => {
    if (executable) {
      try {
        await stopExecutable(executable.id);
        setIsRunning(false);
      } catch (error) {
        console.error("Failed to stop:", error);
      }
    }
  };

  return { isRunning, handleLaunch, handleStop };
}

type ActionButtonProps = {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  onDetailClick?: () => void;
  variant: "primary" | "danger" | "disabled";
  className?: string;
};

function ActionButton({
  label,
  icon: Icon,
  onClick,
  onDetailClick,
  variant,
  className,
}: ActionButtonProps) {
  const styles = {
    primary: {
      container:
        "border-transparent bg-primary text-black focus-visible:ring-primary-2",
      main: "hover:bg-primary-2",
      detail: "hover:bg-primary-2",
    },
    danger: {
      container:
        "border-transparent bg-destructive text-white focus-visible:ring-destructive",
      main: "hover:bg-destructive-2",
      detail: "hover:bg-destructive-2",
    },
    disabled: {
      container: "border-white/5 bg-white/5",
      main: "opacity-50 text-white/40 cursor-not-allowed pointer-events-none",
      detail: "hover:bg-white/5 text-white",
    },
  };

  const currentStyle = styles[variant];
  const containerClass = `flex w-full h-full items-center rounded-md border shadow-sm  ${
    currentStyle.container
  } ${
    !onDetailClick ? `hover:${currentStyle.main.replace("hover:", "")}` : ""
  } ${className || ""}`;

  return (
    <div className={containerClass}>
      <button
        onClick={onClick}
        disabled={variant === "disabled"}
        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium focus-visible:outline-none rounded-l-md flex-1 ${currentStyle.main}`}
      >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {label}
      </button>

      {onDetailClick && (
        <>
          <div className="h-6 w-px bg-current opacity-20" />
          <button
            onClick={onDetailClick}
            className={`inline-flex h-10 items-center justify-center px-3 focus-visible:outline-none focus-visible:ring-1 rounded-r-md transition-colors ${currentStyle.detail}`}
          >
            <Ellipsis className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

type LaunchButtonProps = {
  executable: Executable | null;
  onDetailClick?: () => void;
};

export default function LaunchButton({
  executable,
  onDetailClick,
}: LaunchButtonProps) {
  const { isRunning, handleLaunch, handleStop } =
    useExecutableStatus(executable);

  if (!executable) return null;

  const config = useMemo(() => {
    if (isRunning) {
      return {
        label: "Stop",
        icon: CircleX,
        action: handleStop,
        variant: "danger" as const,
      };
    }
    if (executable.path) {
      return {
        label: "Launch",
        icon: Play,
        action: handleLaunch,
        variant: "primary" as const,
      };
    }
    return {
      label: "Not Installed",
      action: () => {},
      variant: "disabled" as const,
    };
  }, [isRunning, executable.id, handleLaunch, handleStop]);

  return (
    <ActionButton
      label={config.label}
      icon={config.icon}
      onClick={config.action}
      variant={config.variant}
      onDetailClick={onDetailClick}
    />
  );
}
