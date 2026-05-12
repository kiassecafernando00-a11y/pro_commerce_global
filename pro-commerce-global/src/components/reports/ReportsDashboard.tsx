"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, Download, Calendar, FileSpreadsheet, FileText, Search, ArrowUpRight, ArrowDownRight, Filter, Wallet } from "lucide-react"
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Add type definition for jspdf-autotable to avoid TS errors if types aren't perfect
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

interface ReportsDashboardProps {
    stats: {
        totalSales: number
        saleCount: number
        totalCommissions: number
        totalWithdrawals: number
        withdrawalCount: number
        netRevenue: number
    }
    transactions: any[]
    vendor: {
        name: string
        email: string
        nif?: string
    }
    store: {
        name: string
        id: string
        nif?: string
    }
}

export default function ReportsDashboard({ stats, transactions, vendor, store }: ReportsDashboardProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("ALL")

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = filterType === "ALL" || t.type === filterType
        return matchesSearch && matchesType
    })

    const handleExportExcel = () => {
        // 1. Prepare Data with Header Info
        const headerInfo = [
            ["RELATÓRIO FINANCEIRO - PRO COMMERCE GLOBAL"],
            ["Gerado em:", new Date().toLocaleString('pt-AO')],
            [""],
            ["DADOS DO VENDEDOR"],
            ["Loja:", store.name],
            ["Vendedor:", vendor.name],
            ["NIF:", store.nif || "N/A"],
            [""],
            ["RESUMO"],
            ["Total Vendas:", formatCurrency(stats.totalSales)],
            ["Comissões:", formatCurrency(stats.totalCommissions)],
            ["Receita Líquida:", formatCurrency(stats.netRevenue)],
            [""],
            ["DETALHES DAS TRANSAÇÕES"]
        ]

        // 2. Table Data
        const tableData = filteredTransactions.map(t => ({
            "Data": t.date,
            "Tipo": t.type === 'SALE' ? 'Venda' : t.type === 'COMMISSION' ? 'Comissão' : t.type,
            "Descrição": t.description,
            "ID Pedido": t.orderId || "-",
            "Status": t.status,
            "Valor (Kz)": t.amount
        }))

        // 3. Create Worksheet
        const ws = XLSX.utils.json_to_sheet(tableData, { origin: 'A15' })

        // Add Header rows
        XLSX.utils.sheet_add_aoa(ws, headerInfo, { origin: 'A1' })

        // 4. Create Workbook and Download
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Relatório Financeiro")
        XLSX.writeFile(wb, `Relatorio_Financeiro_${store.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const handleExportPDF = () => {
        const doc = new jsPDF()

        // Colors
        const brandColor = "#1e3a8a" // Blue 900
        const accentColor = "#d97706" // Amber 600

        // Header
        doc.setFillColor(243, 244, 246) // Gray 100
        doc.rect(0, 0, 210, 40, 'F')

        doc.setFontSize(22)
        doc.setTextColor(brandColor)
        doc.setFont("helvetica", "bold")
        doc.text("ProCommerce Global", 14, 20)

        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.text("Relatório de Transações Financeiras", 14, 28)

        doc.setFontSize(9)
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-AO')}`, 200, 20, { align: 'right' })

        // Vendor Info Box
        doc.setDrawColor(200)
        doc.roundedRect(14, 45, 182, 35, 2, 2)

        doc.setFontSize(11)
        doc.setTextColor(0)
        doc.setFont("helvetica", "bold")
        doc.text("Dados da Loja", 20, 55)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(80)
        doc.text(`Loja: ${store.name}`, 20, 62)
        doc.text(`Responsável: ${vendor.name}`, 20, 68)
        doc.text(`NIF: ${store.nif || "N/A"}`, 20, 74)

        // Summary Stats
        const startY = 90
        doc.setFontSize(12)
        doc.setTextColor(brandColor)
        doc.setFont("helvetica", "bold")
        doc.text("Resumo Financeiro", 14, startY)

        // Draw Stats Cards (Manual Drawing)
        const items = [
            { label: "Vendas Totais", value: formatCurrency(stats.totalSales) },
            { label: "Comissões", value: formatCurrency(stats.totalCommissions) },
            { label: "Receita Líquida", value: formatCurrency(stats.netRevenue) }
        ]

        let cardX = 14
        items.forEach(item => {
            doc.setFillColor(250, 250, 255)
            doc.setDrawColor(brandColor)
            doc.roundedRect(cardX, startY + 5, 55, 20, 1, 1, 'FD')

            doc.setFontSize(8)
            doc.setTextColor(100)
            doc.text(item.label, cardX + 5, startY + 12)

            doc.setFontSize(10)
            doc.setTextColor(0)
            doc.setFont("helvetica", "bold")
            doc.text(item.value, cardX + 5, startY + 20)

            cardX += 60
        })

        // Table
        const tableBody = filteredTransactions.map(t => [
            t.date,
            t.type,
            t.description,
            t.status,
            formatCurrency(t.amount)
        ])

        doc.autoTable({
            startY: startY + 35,
            head: [['Data', 'Tipo', 'Descrição', 'Status', 'Valor']],
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: brandColor, textColor: 255 },
            styles: { fontSize: 8, cellPadding: 3 },
            alternateRowStyles: { fillColor: [248, 250, 252] }
        })

        // Footer
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150)
            doc.text(`Página ${i} de ${pageCount}`, 105, 290, { align: 'center' })
            doc.text("Confidencial - Uso exclusivo do vendedor", 105, 285, { align: 'center' })
        }

        doc.save(`Relatorio_${store.name}_${new Date().toISOString().split('T')[0]}.pdf`)
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Relatórios Financeiros</h1>
                    <p className="text-slate-500">Acompanhe o desempenho da loja <span className="font-bold text-slate-700">{store.name}</span></p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <FileSpreadsheet className="w-4 h-4" /> Exportar Excel
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        <FileText className="w-4 h-4" /> Exportar PDF
                    </button>
                </div>
            </div>

            {/* Stats Grid - Professional Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-24 h-24 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Vendas</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.totalSales)}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>{stats.saleCount} pedidos</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="w-24 h-24 text-red-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Comissões</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.totalCommissions)}</p>
                    <p className="mt-2 text-xs text-slate-400">Taxas da plataforma (5%)</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Download className="w-24 h-24 text-orange-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                            <Download className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Saques</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">{formatCurrency(stats.totalWithdrawals)}</p>
                    <p className="mt-2 text-xs text-slate-400">{stats.withdrawalCount} concluídos</p>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 relative text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-white/10 text-brand-gold rounded-xl backdrop-blur-sm">
                            <Wallet className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Receita Líquida</span>
                    </div>
                    <p className="text-3xl font-black text-brand-gold tracking-tight">{formatCurrency(stats.netRevenue)}</p>
                    <p className="mt-2 text-xs text-slate-400">Disponível para saque</p>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        Transações Recentes
                    </h3>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por ID ou descrição..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-lg text-sm font-medium outline-none transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="pl-3 pr-8 py-2 bg-slate-50 border-2 border-slate-100 focus:border-blue-500 rounded-lg text-sm font-bold text-slate-600 outline-none appearance-none cursor-pointer"
                            >
                                <option value="ALL">Todos</option>
                                <option value="SALE">Vendas</option>
                                <option value="COMMISSION">Comissões</option>
                                <option value="WITHDRAWAL">Saques</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Ref</th>
                                <th className="text-right py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor</th>
                                <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-4 px-6 text-sm font-medium text-slate-600">{t.date}</td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${t.type === 'SALE' ? 'bg-green-50 text-green-700' :
                                            t.type === 'COMMISSION' ? 'bg-red-50 text-red-700' :
                                                'bg-orange-50 text-orange-700'
                                            }`}>
                                            {t.type === 'SALE' && <ArrowDownRight className="w-3 h-3" />}
                                            {t.type === 'COMMISSION' && <ArrowUpRight className="w-3 h-3" />}
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-slate-800 font-medium max-w-xs truncate" title={t.description}>{t.description}</td>
                                    <td className="py-4 px-6 text-xs font-mono text-slate-400">{t.orderId ? '#' + t.orderId.slice(-6).toUpperCase() : '-'}</td>
                                    <td className={`py-4 px-6 text-right font-bold text-sm ${t.type === 'SALE' ? 'text-green-600' :
                                        t.type === 'COMMISSION' ? 'text-red-500' : 'text-slate-900'
                                        }`}>
                                        {t.type === 'SALE' ? '+' : '-'} {formatCurrency(Math.abs(t.amount))}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                            t.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                'bg-rose-100 text-rose-700'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p>Nenhuma transação encontrada.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
