import Link from "next/link"
import { ArrowRight, CheckCircle2, Globe, Heart, Lightbulb, Mail, MapPin, Phone, ShieldCheck, Users } from "lucide-react"
import { prisma } from "@/lib/prisma"

async function getSystemInfo() {
    return await prisma.systemConfig.findUnique({ where: { id: "global" } })
}

export default async function InfoPage() {
    const config = await getSystemInfo()

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">

            {/* Hero Section */}
            <section className="relative py-24 overflow-hidden bg-[#0B1120] text-white">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]"></div>

                <div className="container relative mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700 text-brand-gold text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
                        Sobre a ProCommerce
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight text-white drop-shadow-lg">
                        O Futuro do Comércio <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 animate-gradient-x">em Angola e no Mundo</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-100 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Conectamos vendedores ambiciosos a clientes exigentes através de uma plataforma robusta, segura e inovadora.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-3xl font-bold mb-4">A Nossa Missão</h2>
                                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                                    {config?.companyMission || "Democratizar o acesso ao comércio digital em Angola, fornecendo ferramentas de nível mundial para que pequenos e grandes negócios possam prosperar na economia digital."}
                                </p>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-4">A Nossa Visão</h2>
                                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">
                                    {config?.companyVision || "Ser a principal referência de e-commerce na África Lusófona, reconhecida pela excelência tecnológica, confiança e impacto positivo na vida das pessoas."}
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-3xl bg-gray-100 overflow-hidden relative shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
                                {/* Placeholder for an office or abstract image - using a gradient for now */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Globe className="w-32 h-32 text-white/20" />
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-gray-100 max-w-xs">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 bg-green-100 rounded-full text-green-600">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">10k+</p>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Usuários Ativos</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Nossos Valores</h2>
                        <p className="text-gray-600">
                            Os princípios que guiam cada decisão que tomamos e cada linha de código que escrevemos.
                        </p>
                    </div>

                    <ValuesGrid valuesJson={config?.companyValues} />
                </div>
            </section>

            {/* Contact Info (Dynamic) */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="bg-[#0B1120] rounded-[2.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 relative z-10">Fale Conosco</h2>

                        <div className="grid md:grid-cols-3 gap-8 relative z-10 mb-12">
                            {config?.supportEmail && (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                    <Mail className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm mb-1">Email de Suporte</p>
                                    <p className="text-white font-medium">{config.supportEmail}</p>
                                </div>
                            )}
                            {config?.supportPhone && (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                    <Phone className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm mb-1">Telefone / WhatsApp</p>
                                    <p className="text-white font-medium">{config.supportPhone}</p>
                                </div>
                            )}
                            {config?.address && (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                    <MapPin className="w-8 h-8 text-yellow-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm mb-1">Sede</p>
                                    <p className="text-white font-medium max-w-[200px] mx-auto">{config.address}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 relative z-10">
                            <Link href="/auth/register" className="bg-white text-gray-900 font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                Tornar-se Vendedor <ArrowRight className="w-5 h-5 text-yellow-500" />
                            </Link>
                            <Link href="/contact" className="bg-white/10 text-white font-bold py-4 px-8 rounded-xl hover:bg-white transition-colors hover:text-gray-900 backdrop-blur-sm border border-white/20">
                                Central de Ajuda
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}

function ValuesGrid({ valuesJson }: { valuesJson?: string | null }) {
    let values = [
        { title: "Inovação", description: "Buscamos constantemente novas formas de resolver problemas antigos, usando tecnologia de ponta.", icon: "lightbulb" },
        { title: "Segurança", description: "A confiança é a nossa moeda mais valiosa. Protegemos os dados e transações dos nossos usuários a todo custo.", icon: "shield" },
        { title: "Cliente no Centro", description: "O sucesso dos nossos vendedores e a satisfação dos compradores são a nossa única métrica de sucesso.", icon: "heart" }
    ]

    if (valuesJson) {
        try {
            const parsed = JSON.parse(valuesJson)
            if (Array.isArray(parsed) && parsed.length > 0) {
                values = parsed
            }
        } catch (e) {
            console.error("Failed to parse company values JSON", e)
        }
    }

    const getIcon = (name: string) => {
        switch (name.toLowerCase()) {
            case 'shield': return <ShieldCheck className="w-8 h-8 text-blue-600" />
            case 'heart': return <Heart className="w-8 h-8 text-red-600" />
            case 'lightbulb': return <Lightbulb className="w-8 h-8 text-yellow-600" />
            case 'users': return <Users className="w-8 h-8 text-green-600" />
            case 'globe': return <Globe className="w-8 h-8 text-indigo-600" />
            case 'check': return <CheckCircle2 className="w-8 h-8 text-teal-600" />
            default: return <CheckCircle2 className="w-8 h-8 text-gray-600" />
        }
    }

    return (
        <div className="grid md:grid-cols-3 gap-8">
            {values.map((val, idx) => (
                <ValueCard
                    key={idx}
                    icon={getIcon(val.icon || 'check')}
                    title={val.title}
                    description={val.description}
                />
            ))}
        </div>
    )
}

function ValueCard({ icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-yellow-400 shadow-sm hover:shadow-xl transition-shadow duration-300 relative group overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
            <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
            <p className="text-gray-600 leading-relaxed">
                {description}
            </p>
        </div>
    )
}
