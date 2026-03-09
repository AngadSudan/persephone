"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useColors } from "@/components/General/(Color Manager)/useColors";

type CreateWishlistModalProps = {
    open: boolean;
    onClose: () => void;
    onCreate: (payload: { name: string; description?: string }) => Promise<void>;
};

export default function CreateWishlistModal({
    open,
    onClose,
    onCreate,
}: CreateWishlistModalProps) {
    const Colors = useColors();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleCreate = async () => {
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onCreate({ name: name.trim(), description: description.trim() || undefined });
            setName("");
            setDescription("");
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
                className={`w-full max-w-lg rounded-2xl p-6 ${Colors.background.primary} ${Colors.border.specialThin}`}
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 className={`text-xl font-semibold ${Colors.text.primary}`}>
                        Create Wishlist
                    </h2>
                    <button
                        className={`${Colors.text.secondary} ${Colors.properties.interactiveButton}`}
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`text-sm ${Colors.text.secondary}`}>Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Frontend Shortlist"
                            className={`mt-1 w-full rounded-lg px-3 py-2 ${Colors.background.secondary} ${Colors.border.defaultThin} ${Colors.text.primary}`}
                        />
                    </div>

                    <div>
                        <label className={`text-sm ${Colors.text.secondary}`}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Optional"
                            rows={3}
                            className={`mt-1 w-full rounded-lg px-3 py-2 ${Colors.background.secondary} ${Colors.border.defaultThin} ${Colors.text.primary}`}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className={`rounded-lg px-4 py-2 ${Colors.border.defaultThin} ${Colors.text.primary} ${Colors.properties.interactiveButton}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={loading || !name.trim()}
                            className={`rounded-lg px-4 py-2 font-semibold ${Colors.background.special} ${Colors.text.inverted} disabled:opacity-60 ${Colors.properties.interactiveButton}`}
                        >
                            {loading ? "Creating..." : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
