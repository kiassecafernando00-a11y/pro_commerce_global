
"use client"

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, CheckCircle, XCircle, ExternalLink, Eye } from 'lucide-react'
import Image from 'next/image'

interface StoreApprovalModalProps {
    isOpen: boolean
    onClose: () => void
    store: {
        id: string
        name: string
        registrationFeeProof?: string | null
    } | null
    onApprove: (id: string) => void
    onReject: (id: string) => void
}

export default function StoreApprovalModal({ isOpen, onClose, store, onApprove, onReject }: StoreApprovalModalProps) {
    if (!store) return null

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={onClose} className="relative z-50">
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
                </Transition.Child>

                {/* Modal Content */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <Dialog.Title className="text-lg font-bold text-gray-900">
                                        Verificação de Comprovativo
                                    </Dialog.Title>
                                    <p className="text-sm text-gray-500">Loja: {store.name}</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 bg-slate-50 flex flex-col items-center justify-center min-h-[300px]">
                                {store.registrationFeeProof ? (
                                    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 bg-white shadow-inner">
                                        <Image
                                            src={store.registrationFeeProof}
                                            alt="Comprovativo de Pagamento"
                                            fill
                                            className="object-contain"
                                        />
                                        <a
                                            href={store.registrationFeeProof}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute top-2 right-2 bg-white/90 p-2 rounded-lg shadow-sm hover:bg-white text-blue-600 text-xs font-bold flex items-center gap-1"
                                        >
                                            <ExternalLink className="w-3 h-3" /> Abrir Original
                                        </a>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                                        <XCircle className="w-12 h-12 mb-2 opacity-20" />
                                        <p>Nenhum comprovativo enviado</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer / Actions */}
                            <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3">
                                <button
                                    onClick={() => { onReject(store.id); onClose(); }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Rejeitar Loja
                                </button>
                                <button
                                    onClick={() => { onApprove(store.id); onClose(); }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-colors"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Aprovar Loja
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}
