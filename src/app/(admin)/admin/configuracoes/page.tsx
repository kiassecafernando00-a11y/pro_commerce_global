
import { prisma } from "@/lib/prisma"
import { Settings, Save, Smartphone, Mail, AlertTriangle, MapPin, Clock, Facebook, Instagram, Linkedin, Youtube, Video } from "lucide-react"
import { updateSystemSettings } from "./actions"

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
    // Fetch current settings or use defaults if not initialized
    const settings = await prisma.systemConfig.findUnique({ where: { id: "global" } })

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-8 h-8 text-slate-800" />
                    Configurações Gerais
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <form action={async (formData) => {
                    "use server"
                    await updateSystemSettings(formData)
                }} className="p-8 space-y-8">

                    {/* Identity */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Identidade e Marca</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Nome da Plataforma</label>
                                <input
                                    name="appName"
                                    defaultValue={settings?.appName || "ProCommerceGlobal"}
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Footer Content */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Rodapé (Footer)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-600">Slogan do Rodapé</label>
                                <input
                                    name="footerSlogan"
                                    defaultValue={settings?.footerSlogan || ""}
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="A maior plataforma de comércio..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-600">Copyright Text</label>
                                <input
                                    name="footerCopyright"
                                    defaultValue={settings?.footerCopyright || ""}
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="ProCommerceGlobal. Todos os direitos reservados."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Institutional Info */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Sobre Nós (Missão & Visão)</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Missão da Empresa</label>
                                <textarea name="companyMission" defaultValue={settings?.companyMission || ""} rows={3} className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" placeholder="Ex: Democratizar o acesso..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Visão da Empresa</label>
                                <textarea name="companyVision" defaultValue={settings?.companyVision || ""} rows={3} className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" placeholder="Ex: Ser a maior referência..." />
                            </div>
                            {/* Note: Values would be better with a dynamic list component, but for now we'll keep it simple or use a JSON field if needed, 
                                 but user asked for editable info. Let's provide a JSON textarea for Values for MVP or just simple text inputs if we want to fix structure. 
                                 Since the schema defines it as a String, we'll let them edit the raw JSON or just text for now? 
                                 Wait, the prompt asked to be editable. I defined companyValues as String. 
                                 I'll add a simple textarea for now for "Values JSON" with a helper note, to allow full flexibility 
                                 OR, better, since I control the frontend `InfoPage`, I can parse it there. 
                                 Actually, for better UX, I should probably just let them write regular text for now or simple lines.
                                 Let's adhere to the schema I pushed. `companyValues` string.
                             */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Valores (JSON Format)</label>
                                <p className="text-xs text-gray-400">Formato: <code>[{`{"title": "Inovação", "description": "...", "icon": "lightbulb"}`}]</code></p>
                                <textarea
                                    name="companyValues"
                                    defaultValue={settings?.companyValues || JSON.stringify([
                                        { title: "Inovação", description: "Buscamos constantemente novas formas...", icon: "lightbulb" },
                                        { title: "Segurança", description: "A confiança é a nossa moeda...", icon: "shield" },
                                        { title: "Cliente", description: "O sucesso dos nossos vendedores...", icon: "heart" }
                                    ], null, 2)}
                                    rows={10}
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 font-mono text-xs"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Contacts & Location */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Suporte & Localização</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Mail className="w-4 h-4" /> Email de Suporte</label>
                                <input
                                    name="supportEmail"
                                    defaultValue={settings?.supportEmail || ""}
                                    placeholder="suporte@procommerce.com"
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Smartphone className="w-4 h-4" /> Telefone / WhatsApp</label>
                                <input
                                    name="supportPhone"
                                    defaultValue={settings?.supportPhone || ""}
                                    placeholder="+244 9..."
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><MapPin className="w-4 h-4" /> Endereço Físico</label>
                                <input
                                    name="address"
                                    defaultValue={settings?.address || ""}
                                    placeholder="Rua Exemplo, 123, Luanda, Angola"
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Clock className="w-4 h-4" /> Horário de Funcionamento</label>
                                <input
                                    name="workingHours"
                                    defaultValue={settings?.workingHours || "Seg - Sex: 8h às 18h"}
                                    placeholder="Seg - Sex: 8h às 18h"
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Social Media */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Redes Sociais</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Facebook className="w-4 h-4" /> Facebook URL</label>
                                <input name="socialFacebook" defaultValue={settings?.socialFacebook || ""} className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" placeholder="https://facebook.com/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Instagram className="w-4 h-4" /> Instagram URL</label>
                                <input name="socialInstagram" defaultValue={settings?.socialInstagram || ""} className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" placeholder="https://instagram.com/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn URL</label>
                                <input name="socialLinkedin" defaultValue={settings?.socialLinkedin || ""} className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Video className="w-4 h-4" /> TikTok URL</label>
                                <input name="socialTiktok" defaultValue={settings?.socialTiktok || ""} className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" placeholder="https://tiktok.com/@..." />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Youtube className="w-4 h-4" /> YouTube URL</label>
                                <input name="socialYoutube" defaultValue={settings?.socialYoutube || ""} className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" placeholder="https://youtube.com/@..." />
                            </div>
                        </div>
                    </section>

                    {/* Mobile Apps */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Aplicações Móveis</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Smartphone className="w-4 h-4" /> App Store (iOS)</label>
                                <input name="appStoreUrl" defaultValue={settings?.appStoreUrl || ""} className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" placeholder="https://apps.apple.com/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600 flex items-center gap-2"><Smartphone className="w-4 h-4" /> Google Play (Android)</label>
                                <input name="googlePlayUrl" defaultValue={settings?.googlePlayUrl || ""} className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" placeholder="https://play.google.com/..." />
                            </div>
                        </div>
                    </section>

                    {/* Legal Policies */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Documentos Legais</h2>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Termos e Condições (Markdown/Texto)</label>
                                <textarea
                                    name="policyTerms"
                                    defaultValue={settings?.policyTerms || ""}
                                    rows={6}
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    placeholder="# Termos de Serviço..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Política de Privacidade (Markdown/Texto)</label>
                                <textarea
                                    name="policyPrivacy"
                                    defaultValue={settings?.policyPrivacy || ""}
                                    rows={6}
                                    className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    placeholder="# Política de Privacidade..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Financial Rules */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Regras Financeiras</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Comissão da Plataforma (%)</label>
                                <div className="relative">
                                    <input
                                        name="platformFeePercent"
                                        type="number"
                                        step="0.1"
                                        defaultValue={settings?.platformFeePercent?.toString() || "5.0"}
                                        className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                                    />
                                    <span className="absolute right-4 top-3.5 text-gray-500 font-bold">%</span>
                                </div>
                                <p className="text-xs text-gray-400">Aplicado sobre todas as vendas.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Taxa de Inscrição de Vendedor (AOA)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-500 font-bold">Kz</span>
                                    <input
                                        name="vendorRegistrationFee"
                                        type="number"
                                        defaultValue={settings?.vendorRegistrationFee?.toString() || "5000"}
                                        className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none pl-12"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Analytics & Advanced */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 border-b pb-2">Analítica & Funcionalidades (Avançado)</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Google Analytics ID</label>
                                <input name="googleAnalyticsId" defaultValue={settings?.googleAnalyticsId || ""} placeholder="G-XXXXXXXXXX" className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-600">Facebook Pixel ID</label>
                                <input name="facebookPixelId" defaultValue={settings?.facebookPixelId || ""} placeholder="1234567890" className="w-full p-3 border rounded-lg bg-gray-50 text-gray-900" />
                            </div>
                        </div>

                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-700">Avaliações de Produtos</h3>
                                    <p className="text-xs text-gray-500">Permitir que clientes avaliem produtos comprados.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="enableReviews" className="sr-only peer" defaultChecked={settings?.enableReviews} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between border-t pt-3 border-gray-200">
                                <div>
                                    <h3 className="font-bold text-gray-700">Módulo de Blog</h3>
                                    <p className="text-xs text-gray-500">Ativar secção de notícias e artigos.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="enableBlog" className="sr-only peer" defaultChecked={settings?.enableBlog} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between border-t pt-3 border-gray-200">
                                <div>
                                    <h3 className="font-bold text-gray-700">Produtos Digitais</h3>
                                    <p className="text-xs text-gray-500">Permitir venda de arquivos e downloads.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="enableDigitalProducts" className="sr-only peer" defaultChecked={settings?.enableDigitalProducts} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section className="space-y-4 pt-4">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 p-2 rounded-full text-red-600">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-900">Modo de Manutenção</h3>
                                    <p className="text-sm text-red-700">Se ativo, apenas administradores podem acessar o site.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="maintenanceMode" className="sr-only peer" defaultChecked={settings?.maintenanceMode} />
                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </section>

                    <div className="pt-6 flex justify-end">
                        <button type="submit" className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl hover:bg-black transition-all shadow-lg flex items-center gap-2">
                            <Save className="w-5 h-5" /> Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
