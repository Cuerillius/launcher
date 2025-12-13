import TypingText from "../ui/typing";

export function ErrorPage({
  errorCode,
  errorMessage,
}: {
  errorCode: number;
  errorMessage: string | string[];
}) {
  return (
    <div className="flex h-full w-full overflow-hidden bg-background items-center justify-center font-mono p-4">
      <div className="flex flex-col justify-between items-start w-full max-w-4xl">
        <div className="inline-block bg-white text-black px-2 py-0.5 text-xs font-bold tracking-wider mb-4">
          {errorCode} ERROR
        </div>
        <div className="min-h-[240px] w-full flex items-start">
          <TypingText
            text={errorMessage}
            typingSpeed={70}
            pauseDuration={1000}
            showCursor={true}
            className="text-6xl md:text-7xl font-light tracking-tight leading-tight"
            cursorClassName="h-12 md:h-16"
            textColors={["#FFFFFF"]}
            variableSpeed={{ min: 50, max: 120 }}
          />
        </div>
      </div>
    </div>
  );
}

export default ErrorPage;
