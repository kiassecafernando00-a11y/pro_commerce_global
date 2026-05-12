import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, CreditCard, Linkedin, Video } from "lucide-react"
import { NewsletterForm } from "./NewsletterForm"

async function getSystemData() {
    return await prisma.systemConfig.findUnique({
        where: { id: "global" }
    })
}

async function getTopCategories() {
    return await prisma.category.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { products: { _count: 'desc' } }
    })
}

export async function Footer() {
    const data = await getSystemData()
    const categories = await getTopCategories()

    // Defaults
    const appName = data?.appName || "ProCommerceGlobal"
    const slogan = data?.footerSlogan || "A maior plataforma de comércio eletrónico de Angola. Conectamos vendedores e compradores com segurança, rapidez e confiança."
    const copyright = data?.footerCopyright || `© ${new Date().getFullYear()} ${appName}. Todos os direitos reservados.`

    // Contacts
    const address = data?.address || "Luanda, Angola"
    const phone = data?.supportPhone || "+244 923 000 000"
    const email = data?.supportEmail || "comercial@procommerce.com"

    return (
        <footer className="bg-[#0F172A] text-slate-300 border-t border-slate-800">
            {/* Newsletter Strip */}
            <div className="border-b border-slate-800 bg-[#1E293B]">
                <div className="container mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-gold/10 rounded-full text-brand-gold">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Subscreva a nossa Newsletter</h3>
                            <p className="text-sm text-slate-400">Receba ofertas exclusivas e novidades no seu email.</p>
                        </div>
                    </div>
                    <NewsletterForm />
                </div>
            </div>

            {/* Main Links */}
            <div className="container mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Brand Column */}
                <div className="space-y-6">
                    <Link href="/" className="text-2xl font-black text-white block">
                        {appName.substring(0, 3)}<span className="text-brand-gold">{appName.substring(3, 11)}</span>{appName.substring(11)}
                    </Link>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        {slogan}
                    </p>
                    <div className="flex items-center gap-4">
                        {data?.socialFacebook && <SocialLink icon={<Facebook className="w-5 h-5" />} href={data.socialFacebook} />}
                        {data?.socialInstagram && <SocialLink icon={<Instagram className="w-5 h-5" />} href={data.socialInstagram} />}
                        {data?.socialLinkedin && <SocialLink icon={<Linkedin className="w-5 h-5" />} href={data.socialLinkedin} />}
                        {data?.socialTiktok && <SocialLink icon={<Video className="w-5 h-5" />} href={data.socialTiktok} />}
                        {data?.socialYoutube && <SocialLink icon={<Youtube className="w-5 h-5" />} href={data.socialYoutube} />}

                        {/* Fallback if no social media */}
                        {!data?.socialFacebook && !data?.socialInstagram && (
                            <SocialLink icon={<Instagram className="w-5 h-5" />} href="#" />
                        )}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-white font-bold mb-6">Links Rápidos</h4>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/produtos" className="hover:text-brand-gold transition-colors">Todos os Produtos</Link></li>
                        <li><Link href="/auth/register" className="hover:text-brand-gold transition-colors">Vender na Plataforma</Link></li>
                        <li><Link href="/minhas-compras" className="hover:text-brand-gold transition-colors">Rastrear Pedido</Link></li>
                        <li><Link href="/blog" className="hover:text-brand-gold transition-colors">Blog & Dicas</Link></li>
                    </ul>
                </div>

                {/* Categories */}
                <div>
                    <h4 className="text-white font-bold mb-6">Categorias Populares</h4>
                    <ul className="space-y-4 text-sm">
                        {categories.map(cat => (
                            <li key={cat.id}><Link href={`/produtos?cat=${cat.slug}`} className="hover:text-brand-gold transition-colors">{cat.name}</Link></li>
                        ))}
                        {categories.length === 0 && (
                            <>
                                <li><Link href="/produtos?cat=tecnologia" className="hover:text-brand-gold transition-colors">Tecnologia & Eletrônicos</Link></li>
                                <li><Link href="/produtos?cat=moda" className="hover:text-brand-gold transition-colors">Moda & Acessórios</Link></li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-white font-bold mb-6">Contactos</h4>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-brand-gold shrink-0" />
                            <span>{address}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-brand-gold shrink-0" />
                            <span>{phone}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-brand-gold shrink-0" />
                            <span>{email}</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-slate-800 bg-[#020617]">
                <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-500">
                        {copyright}
                    </p>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                            <CreditCard className="w-6 h-6 text-white" />
                            <span className="text-xs text-white">Multicaixa</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                            <CreditCard className="w-6 h-6 text-blue-400" />
                            <span className="text-xs text-white">Visa (Brevemente)</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function SocialLink({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-brand-gold hover:text-slate-900 transition-all"
        >
            {icon}
        </a>
    )
}
