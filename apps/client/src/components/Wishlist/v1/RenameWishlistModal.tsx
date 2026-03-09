"use client";

import { useState } from "react";
import { useEffect } from "react";
import { X } from "lucide-react";
import { useColors } from "@/components/General/(Color Manager)/useColors";

type RenameWishlistModalProps = {
    open: boolean;
    initialName: string;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
};

export default function RenameWishlistModal({
    open,
    initialName,
    onClose,
    onSave,
}: RenameWishlistModalProps) {
    const Colors = useColors();
    const [name, setName] = useState(initialName);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) setName(initialName);
    }, [open, initialName]);

    if (!open) return null;

    const handleSave = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onSave(name.trim());
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            onClick={onClose}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${Colors.background.secondary}`}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md rounded-2xl p-6 ${Colors.background.primary} ${Colors.border.specialThin}`}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className={`text-lg font-semibold ${Colors.text.primary}`}>
                        Edit Wishlist Name
                    </h2>
                    <button
                        className={`${Colors.text.secondary} ${Colors.properties.interactiveButton}`}
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 ${Colors.background.secondary} ${Colors.border.defaultThin} ${Colors.text.primary}`}
                />

                <div className="mt-5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className={`rounded-lg px-4 py-2 ${Colors.border.defaultThin} ${Colors.text.primary} ${Colors.properties.interactiveButton}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !name.trim()}
                        className={`rounded-lg px-4 py-2 font-semibold ${Colors.background.special} ${Colors.text.inverted} disabled:opacity-60 ${Colors.properties.interactiveButton}`}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
