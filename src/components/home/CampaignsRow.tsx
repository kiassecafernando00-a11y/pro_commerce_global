import { Award, Gift, Tag, Clock, ArrowRight } from "lucide-react"

interface Campaign {
    id: string
    title: string
    description: string
    type: string
    imageUrl: string | null
    prize: string | null
    link: string | null
}

export default function CampaignsRow({ campaigns }: { campaigns: Campaign[] }) {
    if (!campaigns || campaigns.length === 0) return null

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4">Eventos & Destaques</h3>
                        <p className="text-gray-500 pl-5 text-sm mt-1">Participe nas nossas iniciativas.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {campaigns.map(camp => (
                        <div key={camp.id} className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
                            {camp.imageUrl ? (
                                <div className="h-48 overflow-hidden bg-gray-100">
                                    <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>
                            ) : (
                                <div className={`h-32 flex items-center justify-center text-white
                                    ${camp.type === 'CONTEST' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                                        camp.type === 'TRAINING' ? 'bg-gradient-to-br from-green-600 to-green-800' :
                                            'bg-gradient-to-br from-purple-600 to-purple-800'
                                    }
                                `}>
                                    {camp.type === 'CONTEST' && <Award className="w-12 h-12 opacity-50" />}
                                    {camp.type === 'TRAINING' && <Tag className="w-12 h-12 opacity-50" />}
                                    {camp.type === 'GIVEAWAY' && <Gift className="w-12 h-12 opacity-50" />}
                                </div>
                            )}

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider
                                         ${camp.type === 'CONTEST' ? 'bg-blue-100 text-blue-700' :
                                            camp.type === 'TRAINING' ? 'bg-green-100 text-green-700' :
                                                'bg-purple-100 text-purple-700'
                                        }
                                    `}>
                                        {camp.type === 'CONTEST' ? 'Concurso' : camp.type === 'TRAINING' ? 'Formação' : 'Sorteio'}
                                    </span>
                                    {camp.prize && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded flex items-center gap-1">
                                            🏆 Prémio
                                        </span>
                                    )}
                                </div>

                                <h4 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{camp.title}</h4>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{camp.description}</p>

                                {camp.link && (
                                    <a href={camp.link} className="mt-auto w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-blue-600 text-gray-600 hover:text-blue-600 font-bold py-2.5 rounded-lg transition-all text-sm">
                                        Ver Detalhes <ArrowRight className="w-4 h-4" />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
