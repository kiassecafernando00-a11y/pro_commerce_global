"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function BackToStoreLink() {
    const { t } = useLanguage()

    return (
        <Link
            href="/produtos"
            className="inline-flex items-center text-gray-600 hover:text-brand-dark mb-6 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('common_back_store') || "Voltar para a Loja"}
        </Link>
    )
}
