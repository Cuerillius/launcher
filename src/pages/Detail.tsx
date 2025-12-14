import ExecutableDetailModule from "@/components/display/ExecutableDetailModule";
import {
  ExecutableBanner,
  ExecutableLogo,
} from "@/components/display/ExecutableImage";
import LaunchButton from "@/components/display/LaunchButton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Executable } from "@/types/Executable";
import { Ellipsis } from "lucide-react";

type DetailViewProps = {
  executable: Executable | null;
  onEdit: (id: string) => void;
};

const DetailView = ({ executable, onEdit }: DetailViewProps) => {
  if (!executable) {
    return null;
  }

  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#09090b] text-white scrollbar">
      <div className="absolute inset-0 h-[70vh] w-full">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent)]">
          <ExecutableBanner {...executable} />
        </div>

        <Button
          variant="ghost"
          className="absolute top-5 right-0 m-4 text-gray-400 hover:text-white z-20"
          onClick={() => onEdit(executable.id)}
        >
          <Ellipsis />
        </Button>
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/10 to-transparent" />
        <div className="opacity-50"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-full justify-between">
        <div className="flex flex-1 flex-col justify-end p-8 lg:p-12">
          <div className="flex flex-col space-y-6">
            <div className="w-full max-w-md lg:max-w-xl max-ml-2">
              <ExecutableLogo {...executable} />

              <div className="mt-8 w-60 h-14">
                <LaunchButton executable={executable} />
              </div>
            </div>
          </div>
        </div>
        <div className="px-8 pb-8 lg:px-12 lg:pb-12">
          <ExecutableDetailModule executable={executable} />
        </div>
      </div>
    </div>
  );
};

export const DetailViewSkeleton = () => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#09090b]">
      <div className="relative z-10 flex flex-col min-h-full justify-between">
        <div className="flex flex-1 flex-col justify-end p-8 lg:p-12">
          <div className="flex flex-col space-y-6">
            <div className="w-full max-w-md lg:max-w-xl max-ml-2 space-y-8">
              <Skeleton className="w-60 h-14 rounded-md bg-zinc-800" />
            </div>
          </div>
        </div>
        <div className="px-8 pb-8 lg:px-12 lg:pb-12">
          <div className="relative bg-[#121214] border border-white/5 p-6 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full rounded-lg bg-zinc-800/50" />
              <Skeleton className="h-20 w-full rounded-lg bg-zinc-800/50" />
              <Skeleton className="h-20 w-full rounded-lg bg-zinc-800/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;
