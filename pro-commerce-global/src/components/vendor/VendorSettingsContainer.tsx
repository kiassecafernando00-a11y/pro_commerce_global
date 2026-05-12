"use client"

import { useState } from "react"
import { Store as StoreIcon, MapPin, CreditCard, Settings } from "lucide-react"
import StoreProfileSettings from "./StoreProfileSettings"
import StoreLocationSettings from "./StoreLocationSettings"
import FinancialSettings from "./FinancialSettings"

interface VendorSettingsContainerProps {
    store: any
    bankAccounts: any[]
}

export default function VendorSettingsContainer({ store, bankAccounts }: VendorSettingsContainerProps) {
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'LOCATION' | 'FINANCIAL'>('PROFILE')

    const tabs = [
        { id: 'PROFILE', label: 'Perfil da Loja', icon: StoreIcon },
        { id: 'LOCATION', label: 'Localização e Entrega', icon: MapPin },
        { id: 'FINANCIAL', label: 'Financeiro', icon: CreditCard },
    ] as const

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Settings className="w-8 h-8 text-slate-400" />
                        Configurações da Loja
                    </h1>
                    <p className="text-slate-500 mt-1">Gerencie, personalize e configure todos os detalhes da sua loja.</p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                            }`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-gold' : ''}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === 'PROFILE' && (
                    <StoreProfileSettings initialData={store} />
                )}

                {activeTab === 'LOCATION' && (
                    <StoreLocationSettings initialData={store} />
                )}

                {activeTab === 'FINANCIAL' && (
                    <FinancialSettings bankAccounts={bankAccounts} />
                )}
            </div>
        </div>
    )
}
