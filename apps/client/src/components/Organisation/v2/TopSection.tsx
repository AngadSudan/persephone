import { useColors } from "@/components/General/(Color Manager)/useColors";
import OrganizationInfo from "./OrganizationInfo";

export default function TopSection() {
  const Colors = useColors();
  return (
    <div
      className={`${Colors.background.secondary} rounded-xl gap-4 p-4 w-full grid grid-cols-1`}
    >
      <div className={`${Colors.background.primary} ${Colors.border.defaultThin} w-full rounded-xl p-4`}>
        <OrganizationInfo />
      </div>
    </div>
  );
}
