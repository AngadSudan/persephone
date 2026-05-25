import { useColors } from "@/components/General/(Color Manager)/useColors";
import InteviewerInfo from "./InteviewerInfo";

export default function TopSection() {
  const Colors = useColors();
  return (
    <div
      className={`${Colors.background.secondary} ${Colors.border.fadedThinBottom} px-4 py-4 md:px-5 md:py-5 w-full`}
    >
      <div
        className={`${Colors.background.primary} ${Colors.border.fadedThin} rounded-xl p-4 md:p-5`}
      >
        <InteviewerInfo />
      </div>
    </div>
  );
}
