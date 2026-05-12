import { prisma } from "@/lib/prisma"
import {
    LayoutTemplate, Plus, Trash2, Tag, Gift, Award, Calendar, Power, ExternalLink,
    Banknote, Package, GraduationCap, Sparkles
} from "lucide-react"
import { createBanner, createCampaign, deleteBanner, deleteCampaign, toggleBanner, toggleCampaign } from "./actions"
import { ImageUploadInput } from "@/components/admin/ImageUploadInput"

export default async function MarketingPage() {
    const banners = await prisma.banner.findMany({ orderBy: { createdAt: 'desc' } })
    const campaigns = await prisma.campaign.findMany({ orderBy: { createdAt: 'desc' } })

    return (
        <div className="space-y-12 pb-20">
            <h1 className="text-3xl font-bold text-gray-900">Marketing & Destaques</h1>

            {/* BANNERS SECTION */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <LayoutTemplate className="w-6 h-6 text-blue-600" />
                            Carrossel da Homepage
                        </h2>
                        <p className="text-sm text-gray-500">Gerencie os banners principais que aparecem no topo.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <form action={createBanner} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Título (Opcional)</label>
                            <input name="title" className="w-full p-2 border rounded-lg bg-gray-50 mt-1" placeholder="Ex: Promoção de Verão" />
                        </div>
                        <div className="md:col-span-6">
                            <ImageUploadInput name="imageUrl" label="Imagem do Banner *" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Link de Destino</label>
                            <input name="link" className="w-full p-2 border rounded-lg bg-gray-50 mt-1" placeholder="/shop/verao" />
                        </div>
                        <div className="md:col-span-1">
                            <button className="w-full bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 flex justify-center mt-6 md:mt-0">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map(banner => (
                        <div key={banner.id} className={`group relative rounded-xl overflow-hidden border ${banner.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
                            <div className="aspect-video bg-gray-100 relative">
                                <img src={banner.imageUrl} alt={banner.title || "Banner"} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <form action={async () => { "use server"; await toggleBanner(banner.id, banner.isActive) }}>
                                        <button className={`p-1.5 rounded-full ${banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'} shadow-sm`}>
                                            <Power className="w-4 h-4" />
                                        </button>
                                    </form>
                                    <form action={async () => { "use server"; await deleteBanner(banner.id) }}>
                                        <button className="p-1.5 rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </form>
                                </div>
                            </div>
                            <div className="p-4 bg-white">
                                <h3 className="font-bold text-gray-800 truncate">{banner.title || "Sem título"}</h3>
                                {banner.link && (
                                    <a href={banner.link} target="_blank" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                                        <ExternalLink className="w-3 h-3" /> {banner.link}
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <hr className="border-gray-100" />

            {/* CAMPAIGNS SECTION */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Award className="w-6 h-6 text-purple-600" />
                            Campanhas & Eventos
                        </h2>
                        <p className="text-sm text-gray-500">Concursos, Sorteios e Formações.</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <form action={createCampaign} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-3">
                                <label className="text-xs font-bold text-gray-500 uppercase">Tipo</label>
                                <select name="type" className="w-full p-2 border rounded-lg bg-gray-50 mt-1 h-[42px]">
                                    <option value="CONTEST">Concurso</option>
                                    <option value="TRAINING">Formação</option>
                                    <option value="GIVEAWAY">Sorteio</option>
                                </select>
                            </div>
                            <div className="md:col-span-9">
                                <label className="text-xs font-bold text-gray-500 uppercase">Título</label>
                                <input name="title" required className="w-full p-2 border rounded-lg bg-gray-50 mt-1" placeholder="Ex: Masterclass de Vendas" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ImageUploadInput name="imageUrl" label="Imagem de Capa (Opcional)" placeholder="https://..." />
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Período (Opcional)</label>
                                <div className="flex gap-2">
                                    <input type="date" name="startDate" className="w-full p-2 border rounded-lg bg-gray-50 text-sm" />
                                    <span className="self-center text-gray-400">-</span>
                                    <input type="date" name="endDate" className="w-full p-2 border rounded-lg bg-gray-50 text-sm" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase">Descrição</label>
                            <textarea name="description" required className="w-full p-2 border rounded-lg bg-gray-50 mt-1 h-24" placeholder="Descreva os detalhes da campanha..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Recompensa</label>
                                <div className="flex gap-2 mt-1">
                                    <select name="rewardType" className="w-[120px] p-2 border rounded-l-lg bg-gray-50 text-sm font-medium">
                                        <option value="MONEY">Dinheiro</option>
                                        <option value="PRODUCT">Produto</option>
                                        <option value="SERVICE">Serviço</option>
                                        <option value="OTHER">Outro</option>
                                    </select>
                                    <input name="rewardValue" className="flex-1 p-2 border rounded-r-lg bg-gray-50" placeholder="Valor (Ex: 50.000 ou iPhone)" />
                                </div>
                                <input type="hidden" name="prize" value="" /> {/* Legacy support */}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Link de Inscrição/Info</label>
                                <input name="link" className="w-full p-2 border rounded-lg bg-gray-50 mt-1" placeholder="https://..." />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 shadow-md hover:shadow-lg transition-all transform active:scale-95">
                                Criar Campanha
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {campaigns.map(camp => (
                        <div key={camp.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                            <div className={`w-full sm:w-32 h-32 rounded-lg flex items-center justify-center text-white shrink-0 overflow-hidden relative
                                ${camp.type === 'CONTEST' ? 'bg-blue-500' : camp.type === 'TRAINING' ? 'bg-green-500' : 'bg-purple-500'}
                            `}>
                                {camp.imageUrl ? (
                                    <img src={camp.imageUrl} alt={camp.title} className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        {camp.type === 'CONTEST' && <Award className="w-10 h-10" />}
                                        {camp.type === 'TRAINING' && <Tag className="w-10 h-10" />}
                                        {camp.type === 'GIVEAWAY' && <Gift className="w-10 h-10" />}
                                    </>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg truncate pr-2">{camp.title}</h3>
                                        <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                                            <span>{new Date(camp.createdAt).toLocaleDateString('pt-AO')}</span>
                                            {camp.startDate && (
                                                <span className="flex items-center gap-1 text-blue-500 bg-blue-50 px-1.5 rounded">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(camp.startDate).toLocaleDateString('pt-AO')}
                                                    {camp.endDate && ` - ${new Date(camp.endDate).toLocaleDateString('pt-AO')}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <form action={async () => { "use server"; await toggleCampaign(camp.id, camp.isActive) }}>
                                            <button className={`p-1.5 rounded-md ${camp.isActive ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                                                <Power className="w-4 h-4" />
                                            </button>
                                        </form>
                                        <form action={async () => { "use server"; await deleteCampaign(camp.id) }}>
                                            <button className="p-1.5 rounded-md text-red-400 bg-red-50 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                        </form>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{camp.description}</p>

                                <div className="flex flex-wrap gap-2 text-xs">
                                    {(camp.rewardValue || camp.prize) && (
                                        <span className="bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded-md flex items-center gap-1.5">
                                            {camp.rewardType === 'MONEY' && <Banknote className="w-4 h-4" />}
                                            {camp.rewardType === 'PRODUCT' && <Package className="w-4 h-4" />}
                                            {camp.rewardType === 'SERVICE' && <GraduationCap className="w-4 h-4" />}
                                            {(!camp.rewardType || camp.rewardType === 'OTHER') && <Sparkles className="w-4 h-4" />}

                                            {camp.rewardType === 'MONEY'
                                                ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(camp.rewardValue))
                                                : (camp.rewardValue || camp.prize)}
                                        </span>
                                    )}
                                    <span className={`px-2 py-1 rounded-md border font-bold ${camp.type === 'CONTEST' ? 'text-blue-700 border-blue-100 bg-blue-50' :
                                            camp.type === 'TRAINING' ? 'text-green-700 border-green-100 bg-green-50' :
                                                'text-purple-700 border-purple-100 bg-purple-50'
                                        }`}>
                                        {camp.type === 'CONTEST' ? 'Concurso' : camp.type === 'TRAINING' ? 'Formação' : 'Sorteio'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
