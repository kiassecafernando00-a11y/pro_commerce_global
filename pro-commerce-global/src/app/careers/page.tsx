import { Users, Briefcase, ArrowRight, Star, Target, Zap } from "lucide-react"
import Link from "next/link"

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Hero Section - Matching Info Page Style */}
            <section className="relative py-24 overflow-hidden bg-[#0B1120] text-white">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"></div>

                <div className="container relative mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                        Junte-se à Equipa
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg">
                        Construa o Futuro <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 animate-gradient-x">Connosco</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Na ProCommerce Global, não oferecemos apenas empregos. Oferecemos a oportunidade de transformar o comércio digital em Angola e no mundo.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Estamos à procura de <span className="text-blue-600">Talentos Extraordinários</span></h2>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                Acreditamos que as grandes ideias vêm de grandes pessoas.
                                Procuramos mentes criativas, inovadoras e apaixonadas por tecnologia para nos ajudarem
                                a redefinir as regras do jogo.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <FeatureRow
                                icon={<Users className="w-6 h-6 text-yellow-500" />}
                                title="Cultura Inclusiva"
                                description="Valorizamos a diversidade e acreditamos que diferentes perspectivas geram melhores soluções."
                            />
                            <FeatureRow
                                icon={<Target className="w-6 h-6 text-yellow-500" />}
                                title="Impacto Real"
                                description="O seu trabalho terá um impacto direto na vida de milhares de empreendedores e consumidores."
                            />
                            <FeatureRow
                                icon={<Zap className="w-6 h-6 text-yellow-500" />}
                                title="Inovação Constante"
                                description="Aqui, o 'status quo' é o nosso maior inimigo. Desafiamos os limites diariamente."
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-[2.5rem] rotate-3 opacity-20 blur-2xl"></div>
                        <div className="bg-[#0B1120] rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden shadow-2xl border border-yellow-500">
                            {/* Background Effects */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[80px]"></div>

                            <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[400px]">
                                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                                    <Briefcase className="w-10 h-10 text-yellow-400" />
                                </div>
                                <h3 className="text-3xl font-bold mb-4">Sem vagas abertas</h3>
                                <p className="text-gray-400 mb-8 max-w-sm leading-relaxed">
                                    No momento, todas as nossas posições estão preenchidas. Mas estamos sempre de olhos abertos para talentos únicos.
                                </p>

                                <div className="space-y-4 w-full max-w-xs">
                                    <Link href="mailto:careers@procommerce.ao" className="block w-full bg-white text-gray-900 font-bold py-4 px-6 rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200">
                                        Enviar Candidatura Espontânea
                                    </Link>
                                    <Link href="/info" className="block w-full bg-white/5 text-white font-medium py-4 px-6 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
                                        Conheça a Nossa Cultura
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureRow({ icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg border border-transparent hover:border-gray-100 transition-all duration-300 group">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group-hover:border-yellow-200 group-hover:bg-yellow-50 transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">{title}</h4>
                <p className="text-gray-500 leading-snug">{description}</p>
            </div>
        </div>
    )
}
