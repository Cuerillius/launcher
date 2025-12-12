import { Executable } from "@/types/Executable";
import Aurora from "./Aurora";

function ExecutableDetailModule({ executable }: { executable: Executable }) {
  return (
    <div className="relative bg-[#121214] border border-white/5 p-6 flex flex-col rounded-xl overflow-hidden">
      <div className="absolute inset-0">
        {executable.colors && (
          <Aurora colorStops={executable.colors} speed={0.3} />
        )}
      </div>

      <div className="relative z-10 flex-1 grid grid-cols-3 gap-4">
        <div className="bg-black/40 p-4 flex flex-col items-center justify-center border border-white/5 rounded-lg backdrop-blur-sm">
          <div className="text-xl font-bold text-white">
            {executable.playtime != null
              ? `${Math.floor(executable.playtime / 60)}h ${
                  executable.playtime % 60
                }m`
              : "0h 0m"}
          </div>
          <div className="text-[9px] font-bold text-gray-600 mt-1 uppercase tracking-wider">
            Playtime
          </div>
        </div>
        <div className="bg-black/40 p-4 flex flex-col items-center justify-center border border-white/5 rounded-lg backdrop-blur-sm">
          <div className="text-xl font-bold text-white">
            {executable.lastLaunched
              ? (() => {
                  const last = new Date(executable.lastLaunched);
                  const now = new Date();
                  const diffMs = now.getTime() - last.getTime();
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const diffMonths = Math.floor(diffDays / 30);
                  const daysRemainder = diffDays % 30;
                  if (diffMonths > 0 && daysRemainder > 0)
                    return `${diffMonths} month${
                      diffMonths > 1 ? "s" : ""
                    } ${daysRemainder} day${daysRemainder > 1 ? "s" : ""} ago`;
                  if (diffMonths > 0)
                    return `${diffMonths} month${
                      diffMonths > 1 ? "s" : ""
                    } ago`;
                  if (diffDays > 0)
                    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
                  return "Today";
                })()
              : "-"}
          </div>
          <div className="text-[9px] font-bold text-gray-600 mt-1 uppercase tracking-wider">
            Last Played
          </div>
        </div>
        <div className="bg-black/40 p-4 flex flex-col items-center justify-center border border-white/5 rounded-lg backdrop-blur-sm">
          <div className="text-xl font-bold text-white">
            {executable.platform ?? "-"}
          </div>
          <div className="text-[9px] font-bold text-gray-600 mt-1 uppercase tracking-wider">
            Platform
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutableDetailModule;
