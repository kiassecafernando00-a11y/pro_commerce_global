
"use client"

import { Trash2 } from "lucide-react"
import { useState } from "react"

export default function DeleteConfirmer({
    onDelete,
    title = "Apagar?",
    message = "Tem certeza que deseja apagar este item? Esta ação é irreversível."
}: {
    onDelete: () => Promise<void>,
    title?: string,
    message?: string
}) {
    const [loading, setLoading] = useState(false)

    async function handleClick(e: React.MouseEvent) {
        e.preventDefault()
        if (confirm(message)) {
            setLoading(true)
            try {
                await onDelete()
            } catch (error) {
                console.error("Delete failed", error)
                alert("Erro ao apagar.")
            } finally {
                setLoading(false)
            }
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title={title}
        >
            {loading ? <span className="w-4 h-4 block rounded-full border-2 border-red-600 border-t-transparent animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
    )
}
