"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/LanguageContext"
import { ArrowLeft } from "lucide-react"

export function BackLink({ href }: { href: string }) {
    const { t } = useLanguage()
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-dark mb-6 transition-colors font-medium"
        >
            <ArrowLeft className="w-4 h-4" /> {t('common_back_store')}
        </Link>
    )
}
