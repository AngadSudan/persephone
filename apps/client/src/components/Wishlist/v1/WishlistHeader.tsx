"use client";

import { Plus } from "lucide-react";
import { useColors } from "@/components/General/(Color Manager)/useColors";

type WishlistHeaderProps = {
    title: string;
    subtitle: string;
    buttonLabel?: string;
    onCreateClick?: () => void;
};

export default function WishlistHeader({
    title,
    subtitle,
    buttonLabel,
    onCreateClick,
}: WishlistHeaderProps) {
    const Colors = useColors();

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className={`text-3xl font-bold ${Colors.text.primary}`}>{title}</h1>
                <p className={`mt-2 text-sm ${Colors.text.secondary}`}>{subtitle}</p>
            </div>

            {buttonLabel && onCreateClick && (
                <button
                    onClick={onCreateClick}
                    className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold ${Colors.background.special} ${Colors.text.inverted} ${Colors.properties.interactiveButton}`}
                >
                    <Plus size={16} />
                    {buttonLabel}
                </button>
            )}
        </div>
    );
}
