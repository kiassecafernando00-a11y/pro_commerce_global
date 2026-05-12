'use client'

import { useState } from 'react'
import { pickWinner } from '@/app/actions/events'
import toast from 'react-hot-toast'
import { Trophy, Loader2, Sparkles } from 'lucide-react'

export default function PickWinnerButton({ eventId, hasParticipants }: { eventId: string, hasParticipants: boolean }) {
    const [loading, setLoading] = useState(false)

    const handlePickWinner = async () => {
        if (!confirm("Tem certeza que deseja sortear um vencedor agora? Isso encerrará o evento.")) return

        setLoading(true)
        try {
            const result = await pickWinner(eventId)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success(`Vencedor Sorteado: ${result.winner.name}!`)
                // Page triggers revalidatePath, so UI should update automatically (or we can router.refresh())
            }
        } catch (error) {
            toast.error("Erro ao sortear vencedor")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handlePickWinner}
            disabled={loading || !hasParticipants}
            className="w-full py-3 bg-brand-gold text-white font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <Sparkles className="w-5 h-5" />
                    Sortear Vencedor
                </>
            )}
        </button>
    )
}
