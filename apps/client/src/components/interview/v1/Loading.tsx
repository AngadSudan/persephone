import { useColors } from "@/components/General/(Color Manager)/useColors";
function Loading() {
  const theme = useColors();
  return (
    <div
      className={`min-h-screen w-full flex items-center justify-center px-4 ${theme.background.primary}`}
    >
      <div
        className={`w-full max-w-xl rounded-xl p-6 shadow-md ${theme.background.secondary} ${theme.border.fadedThin}`}
      >
        <div className="mb-6 space-y-2">
          <div
            className={`h-6 w-3/4 rounded animate-pulse ${theme.background.heroPrimaryFaded}`}
          />
          <div
            className={`h-4 w-1/2 rounded animate-pulse ${theme.background.heroSecondaryFaded}`}
          />
          <p
            className={`${theme.text.primary} animate-pulse text-sm tracking-wide`}
          >
            Preparing your interview details…
          </p>
        </div>

        {/* Info */}
        <div className="mb-6 space-y-3">
          <div
            className={`h-4 w-full rounded animate-pulse ${theme.background.accent}`}
          />
          <div
            className={`h-4 w-5/6 rounded animate-pulse ${theme.background.accent}`}
          />
          <div
            className={`h-4 w-2/3 rounded animate-pulse ${theme.background.accent}`}
          />
        </div>
        <div className="flex gap-4">
          <div
            className={`h-12 w-full rounded-lg animate-pulse ${theme.background.heroPrimaryFaded}`}
          />
          <div
            className={`h-12 w-full rounded-lg animate-pulse ${theme.background.heroSecondaryFaded}`}
          />
        </div>
        <div
          className={`mt-6 h-3 w-1/3 rounded animate-pulse ${theme.background.special}`}
        />
      </div>
    </div>
  );
}

export default Loading;
