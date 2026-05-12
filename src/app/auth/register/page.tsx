"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building2, User, Mail, Lock, Upload, ArrowRight, ArrowLeft, Globe, MapPin, Phone, Camera, Smartphone, AlertTriangle, CheckCircle, Loader2, Store as StoreIcon, FileText } from "lucide-react"
import { toast } from "react-hot-toast"
import { countries, getCountryByName } from "@/lib/countries"
import { getLocalIp } from "@/app/actions/get-ip"
import { createUploadSession, checkUploadSession } from "@/app/actions/upload-session"
import Tesseract from 'tesseract.js';
import { QRCodeSVG } from 'qrcode.react';
import { useLanguage } from "@/contexts/LanguageContext"

type UserRole = "CUSTOMER" | "VENDOR"
type VendorType = "NATIONAL" | "INTERNATIONAL"

// Rules Configuration
const NATIONAL_DOCS = [
    { value: "BI", label: "Bilhete de Identidade" }
]

const INTERNATIONAL_DOCS = [
    { value: "PASSPORT", label: "Passaporte" },
    { value: "ID_CARD", label: "Cartão de Identidade / ID Card" },
    { value: "RESIDENT_CARD", label: "Cartão de Residente" },
    { value: "DRIVER_LICENSE", label: "Carta de Condução" }
]

export default function RegisterPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [role, setRole] = useState<UserRole>("CUSTOMER")
    const [vendorType, setVendorType] = useState<VendorType>("NATIONAL")
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    // File States (Legacy & Magic)
    const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null)
    const [idDocumentFileBack, setIdDocumentFileBack] = useState<File | null>(null)
    const [magicSessionId, setMagicSessionId] = useState<string | null>(null)
    const [magicFrontUrl, setMagicFrontUrl] = useState<string | null>(null)
    const [magicBackUrl, setMagicBackUrl] = useState<string | null>(null)

    const [isMobile, setIsMobile] = useState(false)
    const [currentUrl, setCurrentUrl] = useState("")

    const [ocrStatus, setOcrStatus] = useState<"IDLE" | "SCANNING" | "SUCCESS" | "FAILED">("IDLE")
    const [ocrMessage, setOcrMessage] = useState("")
    const pollingRef = useRef<NodeJS.Timeout | null>(null)

    const [formData, setFormData] = useState({
        // Account
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "", // Personal Phone
        addPhoneCode: "+244",

        // Personal Data (Vendor Only)
        birthDate: "",
        idDocumentType: "BI", // Default
        idDocumentNumber: "",
        personalAddress: "",

        // Business Data (Store)
        storeName: "",
        businessNif: "",
        businessEmail: "",
        businessPhone: "",
        businessAddress: "",
        country: "Angola",
    })

    // Computed Properties
    const availableDocs = vendorType === "NATIONAL" ? NATIONAL_DOCS : INTERNATIONAL_DOCS
    const requiresBackSide = formData.idDocumentType !== "PASSPORT"

    // Reset Doc Type when Vendor Type changes
    useEffect(() => {
        if (vendorType === "NATIONAL") {
            setFormData(prev => ({ ...prev, idDocumentType: "BI" }))
        } else {
            setFormData(prev => ({ ...prev, idDocumentType: "PASSPORT" }))
        }
    }, [vendorType])

    // Init Logic (Magic Upload)
    useEffect(() => {
        const init = async () => {
            const mobile = window.innerWidth < 768
            setIsMobile(mobile)

            // If returning to Step 2 and Vendor, restart magic upload
            if (!mobile && role === "VENDOR" && step === 2) {
                startMagicUpload(formData.idDocumentType)
            }
        }
        init()
        return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
    }, [step, role]) // dependencies

    // Re-trigger magic upload if doc type changes significantly (new session)
    useEffect(() => {
        if (role === "VENDOR" && !isMobile && step === 2) {
            startMagicUpload(formData.idDocumentType)
        }
    }, [formData.idDocumentType])


    const startMagicUpload = async (docType: string) => {
        // Clear previous
        if (pollingRef.current) clearInterval(pollingRef.current)
        setMagicSessionId(null) // FORCE UI RESET
        setMagicFrontUrl(null)
        setMagicBackUrl(null)

        const session = await createUploadSession(docType)
        if (session.success && session.sessionId) {
            setMagicSessionId(session.sessionId)
            try {
                let baseUrl = window.location.origin
                if (window.location.hostname === 'localhost') {
                    const ip = await getLocalIp()
                    const port = window.location.port
                    baseUrl = `http://${ip}:${port}`
                }
                setCurrentUrl(`${baseUrl}/mobile-upload/${session.sessionId}`)
                startPolling(session.sessionId, docType)
            } catch (e) { }
        } else {
            console.error("Failed to create session")
            alert("Erro ao criar sessão de upload. Tente recarregar a página.")
        }
    }


    const startPolling = (sessionId: string, docType: string) => {
        if (pollingRef.current) clearInterval(pollingRef.current)
        pollingRef.current = setInterval(async () => {
            const status = await checkUploadSession(sessionId)
            if (status.success && status.status === 'COMPLETED') {
                // Check completeness based on Doc Type
                const isPassport = docType === "PASSPORT"
                const complete = isPassport ? !!status.frontImage : (!!status.frontImage && !!status.backImage)

                if (complete) {
                    setMagicFrontUrl(status.frontImage)
                    setMagicBackUrl(status.backImage) // Might be null for passport
                    toast.success(t('reg_success_photos'))
                    if (pollingRef.current) clearInterval(pollingRef.current)
                    setOcrStatus("SUCCESS")
                }
            }
            // Also check if images are there even if status isn't explicitly completed by mobile yet (sync issue)
            // But status 'COMPLETED' is best logic.
        }, 2000)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        if (name === "country") {
            const selectedCountry = getCountryByName(value)
            setFormData(prev => ({ ...prev, country: value, addPhoneCode: selectedCountry?.dialCode || prev.addPhoneCode }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isBack = false) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (isBack) setIdDocumentFileBack(file)
            else {
                setIdDocumentFile(file)
                if (role === "VENDOR") await performOcrValidation(file)
            }
        }
    }

    const performOcrValidation = async (file: File) => {
        setOcrStatus("SCANNING")
        try {
            const { data: { text } } = await Tesseract.recognize(file, 'por')
            const scannedText = text.toUpperCase()
            const inputName = formData.name.toUpperCase().split(" ")[0]
            const inputDocNum = formData.idDocumentNumber.toUpperCase().replace(/[^A-Z0-9]/g, "")

            if (scannedText.includes(inputName) || (inputDocNum.length > 5 && scannedText.replace(/[^A-Z0-9]/g, "").includes(inputDocNum))) {
                setOcrStatus("SUCCESS")
                toast.success("Documento verificado!")
            } else {
                setOcrStatus("FAILED")
                setOcrMessage("Dados não correspondem. Use documento original.")
            }
        } catch (error) {
            setOcrStatus("FAILED")
            // Allow proceed for now manually
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (formData.password !== formData.confirmPassword) {
            toast.error(t('auth_error_password_match'))
            setLoading(false)
            return
        }

        if (role === "VENDOR") {
            // Validate File Uploads
            const hasFront = idDocumentFile || magicFrontUrl
            const hasBack = idDocumentFileBack || magicBackUrl

            if (!hasFront) {
                toast.error("Foto da Frente do documento é obrigatória.") // Should translate too but leaving as fallback for now
                setLoading(false)
                return
            }

            if (requiresBackSide && !hasBack) {
                toast.error("Foto do Verso do documento é obrigatória para este tipo de documento.")
                setLoading(false)
                return
            }
        }

        try {
            const submitData = new FormData()
            // Account
            submitData.append("name", formData.name)
            submitData.append("email", formData.email)
            submitData.append("password", formData.password)
            submitData.append("role", role)

            if (role === "VENDOR") {
                submitData.append("vendorType", vendorType)

                // Personal Data (User Model)
                submitData.append("phone", `${formData.addPhoneCode} ${formData.phone}`)
                submitData.append("birthDate", formData.birthDate)
                submitData.append("idDocumentType", formData.idDocumentType)
                submitData.append("idDocumentNumber", formData.idDocumentNumber)
                submitData.append("personalAddress", formData.personalAddress)

                // Business Data (Store Model)
                submitData.append("storeName", formData.storeName || `${formData.name}'s Store`)
                submitData.append("businessNif", formData.businessNif)
                submitData.append("businessEmail", formData.businessEmail)
                submitData.append("businessPhone", formData.businessPhone)
                submitData.append("businessAddress", formData.businessAddress)
                submitData.append("country", vendorType === "NATIONAL" ? "Angola" : formData.country)

                // Files
                if (idDocumentFile) submitData.append("idDocumentFile", idDocumentFile)
                if (idDocumentFileBack) submitData.append("idDocumentFileBack", idDocumentFileBack)
                if (magicFrontUrl) submitData.append("magicFrontUrl", magicFrontUrl)
                if (magicBackUrl) submitData.append("magicBackUrl", magicBackUrl)
            }

            const res = await fetch("/api/auth/register", { method: "POST", body: submitData })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            toast.success(t('auth_register_success') || "Conta criada com sucesso!")
            if (role === "VENDOR") toast.success(t('auth_vendor_pending') || "Conta em análise.")
            router.push("/auth/login")
        } catch (error: any) {
            toast.error(error.message || t('common_error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-light-gradient flex items-center justify-center p-4">
            {/* Background Decorations similar to Login */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-200/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-200/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            <div className="bg-white/90 backdrop-blur-sm w-full max-w-5xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col md:flex-row h-[90vh] z-10">

                {/* Left Side (Marketing) */}
                <div className="w-full md:w-4/12 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80')] bg-cover bg-center" />
                    <div className="relative z-10">
                        <div className="font-bold text-3xl mb-2 flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-gold rounded-lg flex items-center justify-center shadow-lg shadow-brand-gold/20">
                                <span className="text-brand-dark text-xl font-black">P</span>
                            </div>
                            ProCommerce
                        </div>
                        <p className="text-slate-400 text-lg">Plataforma Global</p>
                    </div>
                </div>

                {/* Right Side (Form) */}
                <div id="register-form-container" className="w-full md:w-8/12 p-8 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-brand-gold/50 scrollbar-track-transparent">
                    <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('reg_title')}</h1>

                    {step === 1 && (
                        <div className="space-y-6">
                            <p className="text-lg text-slate-600 mb-4">{t('reg_choose_role')}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button type="button" onClick={() => setRole("CUSTOMER")} className={`p-8 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${role === "CUSTOMER" ? "border-brand-gold bg-yellow-50 shadow-md transform scale-[1.02]" : "border-slate-200 hover:border-slate-300"}`}>
                                    <User className={`w-10 h-10 mb-4 ${role === "CUSTOMER" ? "text-brand-gold" : "text-slate-400"}`} />
                                    <div className="font-bold text-xl text-slate-900">{t('reg_customer')}</div>
                                </button>
                                <button type="button" onClick={() => setRole("VENDOR")} className={`p-8 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${role === "VENDOR" ? "border-brand-gold bg-yellow-50 shadow-md transform scale-[1.02]" : "border-slate-200 hover:border-slate-300"}`}>
                                    <Building2 className={`w-10 h-10 mb-4 ${role === "VENDOR" ? "text-brand-gold" : "text-slate-400"}`} />
                                    <div className="font-bold text-xl text-slate-900">{t('reg_vendor')}</div>
                                </button>
                            </div>
                            <button onClick={() => setStep(2)} className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-slate-800 flex items-center justify-center gap-3 text-lg transition-all mt-8 transform hover:-translate-y-0.5 shadow-lg">
                                {t('reg_continue')} <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

                            {/* 0. User Type (Origin) */}
                            {role === "VENDOR" && (
                                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200 mb-8 shadow-sm">
                                    <label className="block text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Globe className="w-5 h-5 text-brand-gold" />
                                        {t('reg_origin_title')}
                                    </label>
                                    <div className="flex gap-4">
                                        <button type="button" onClick={() => setVendorType("NATIONAL")} className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${vendorType === "NATIONAL" ? "border-brand-gold bg-white text-brand-dark shadow-md ring-2 ring-yellow-100" : "border-transparent bg-yellow-100/50 text-slate-500 hover:bg-yellow-100"}`}>
                                            🇦🇴 {t('reg_origin_national')}
                                        </button>
                                        <button type="button" onClick={() => setVendorType("INTERNATIONAL")} className={`flex-1 py-4 px-6 rounded-xl border-2 font-bold text-lg transition-all flex items-center justify-center gap-2 ${vendorType === "INTERNATIONAL" ? "border-brand-gold bg-white text-brand-dark shadow-md ring-2 ring-yellow-100" : "border-transparent bg-yellow-100/50 text-slate-500 hover:bg-yellow-100"}`}>
                                            🌍 {t('reg_origin_intl')}
                                        </button>
                                    </div>
                                    <p className="text-slate-600 text-sm mt-3 text-center">
                                        {vendorType === "NATIONAL" ?
                                            `${t('reg_doc_accepted')}: Bilhete de Identidade (BI)` :
                                            `${t('reg_doc_accepted_plural')}: Passaporte, Cartão de Residente, Carta de Condução, ID Card.`}
                                    </p>
                                </div>
                            )}

                            {/* 1. Account Info */}
                            <section>
                                <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-3 pb-2 border-b">
                                    <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-base flex items-center justify-center font-black">1</span>
                                    {t('reg_data_account')}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-base font-semibold text-slate-700 mb-2">{t('auth_name')}</label>
                                        <input name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="Seu nome" required />
                                    </div>
                                    <div>
                                        <label className="block text-base font-semibold text-slate-700 mb-2">{t('auth_email')}</label>
                                        <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="email@exemplo.com" required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <label className="block text-base font-semibold text-slate-700 mb-2">{t('auth_password')}</label>
                                        <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="••••••••" required />
                                    </div>
                                    <div>
                                        <label className="block text-base font-semibold text-slate-700 mb-2">{t('auth_password')}</label>
                                        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="••••••••" required />
                                    </div>
                                </div>
                            </section>

                            {/* VENDOR SECTIONS */}
                            {role === "VENDOR" && (
                                <>
                                    {/* 2. Personal Data (Vendor) */}
                                    <section className="bg-white rounded-2xl">
                                        <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-3 pb-2 border-b">
                                            <span className="w-8 h-8 rounded-full bg-brand-gold text-brand-dark text-base flex items-center justify-center font-black">2</span>
                                            {t('reg_data_personal')}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_personal_phone')}</label>
                                                <div className="flex gap-2">
                                                    <div className="w-24 px-3 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-700 text-lg font-bold flex justify-center items-center">{formData.addPhoneCode}</div>
                                                    <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="flex-1 px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="9xx xxx xxx" required />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_birth_date')}</label>
                                                <input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" required />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_address_personal')}</label>
                                                <input name="personalAddress" value={formData.personalAddress} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="Rua, Bairro, Nº Casa" required />
                                            </div>
                                            <div>
                                                <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_doc_type')}</label>
                                                <select name="idDocumentType" value={formData.idDocumentType} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white">
                                                    {availableDocs.map(doc => (
                                                        <option key={doc.value} value={doc.value}>{doc.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_doc_number')} ({availableDocs.find(d => d.value === formData.idDocumentType)?.label})</label>
                                            <input name="idDocumentNumber" value={formData.idDocumentNumber} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl uppercase focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="Número do Documento" required />
                                        </div>


                                        {/* Document Upload */}
                                        <div className="mt-8 bg-slate-50 p-6 rounded-2xl border-2 border-slate-200 border-dashed hover:border-yellow-300 transition-colors">
                                            <label className="block text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Camera className="w-6 h-6 text-brand-gold" />
                                                {t('reg_upload_title')}: {availableDocs.find(d => d.value === formData.idDocumentType)?.label}
                                            </label>

                                            <div className="mb-4">
                                                {formData.idDocumentType === "PASSPORT" ? (
                                                    <div className="text-sm bg-blue-50 text-blue-700 p-3 rounded-lg flex items-center gap-2">
                                                        <FileText className="w-4 h-4" />
                                                        {t('reg_doc_front_only')}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded-lg flex items-center gap-2">
                                                        <FileText className="w-4 h-4" />
                                                        {t('reg_doc_both_sides')}
                                                    </div>
                                                )}
                                            </div>

                                            {!isMobile && !magicFrontUrl ? (
                                                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm">
                                                    <QRCodeSVG value={currentUrl} size={160} />
                                                    <span className="text-lg font-bold text-slate-900 mt-6">{t('reg_magic_title')}</span>
                                                    <p className="text-slate-500 text-center mt-2 max-w-sm">{t('reg_magic_desc')}</p>
                                                    {magicSessionId && <span className="text-sm text-brand-gold mt-4 flex items-center gap-2 font-medium bg-yellow-50 px-4 py-2 rounded-full"><Loader2 className="w-4 h-4 animate-spin" /> {t('reg_magic_connected')}: {formData.idDocumentType}</span>}
                                                    {/* Localhost Warning omitted for production feel, or keep if needed */}
                                                    <div className="mt-2 flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => startMagicUpload(formData.idDocumentType)}
                                                            className="text-xs text-brand-gold hover:text-yellow-600 underline"
                                                        >
                                                            {t('reg_magic_new_code')}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {magicFrontUrl ? (
                                                        <div className="flex gap-4 items-center justify-center text-green-700 text-lg font-bold bg-green-50 p-6 rounded-xl border-2 border-green-100">
                                                            <CheckCircle className="w-8 h-8" />
                                                            <div>
                                                                <div>{t('reg_success_photos')}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                                                <label className="block text-base font-bold text-slate-700 mb-2">{t('reg_front')}</label>
                                                                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, false)} className="block w-full text-base text-slate-700 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200 cursor-pointer" />
                                                            </div>

                                                            {requiresBackSide && (
                                                                <div className="bg-white p-4 rounded-xl border border-slate-200">
                                                                    <label className="block text-base font-bold text-slate-700 mb-2">{t('reg_back_side')}</label>
                                                                    <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileChange(e, true)} className="block w-full text-base text-slate-700 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200 cursor-pointer" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* 3. Business Data (Store) */}
                                    <section className="bg-white rounded-2xl">
                                        <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-3 pb-2 border-b">
                                            <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-base flex items-center justify-center font-black">3</span>
                                            {t('reg_data_business')}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_store_name')}</label>
                                                <input name="storeName" value={formData.storeName} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="Ex: Minha Loja Oficial" required />
                                            </div>
                                            <div>
                                                <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_nif')}</label>
                                                <input name="businessNif" value={formData.businessNif} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="000000000" required />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div>
                                                <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_email_biz')}</label>
                                                <input name="businessEmail" type="email" value={formData.businessEmail} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="contato@empresa.com" />
                                            </div>
                                            <div>
                                                <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_phone_biz')}</label>
                                                <input name="businessPhone" value={formData.businessPhone} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="9xx xxx xxx" />
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-base font-semibold text-slate-700 mb-2">{t('reg_address_biz')}</label>
                                            <input name="businessAddress" value={formData.businessAddress} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-slate-200 rounded-xl focus:border-brand-gold focus:ring-0 transition-colors bg-slate-50 focus:bg-white" placeholder="Localização exata da empresa" required />
                                        </div>

                                        {vendorType === "INTERNATIONAL" && (
                                            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                                                <label className="block text-base font-bold text-yellow-900 mb-2">{t('reg_country_biz')}</label>
                                                <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-3 text-base border-2 border-yellow-200 rounded-xl bg-white focus:border-brand-gold focus:ring-0 transition-colors">
                                                    {countries.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                    </section>
                                </>
                            )}

                            <div className="flex gap-4 pt-8 border-t border-slate-100">
                                <button type="button" onClick={() => setStep(1)} className="px-8 py-4 border-2 border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors text-lg">
                                    <ArrowLeft className="w-5 h-5 inline mr-2" />
                                    {t('reg_btn_back')}
                                </button>
                                <button type="submit" disabled={loading} className="flex-1 bg-brand-dark text-white py-4 rounded-xl font-bold hover:bg-slate-800 text-lg shadow-xl shadow-slate-900/20 disabled:opacity-70 transition-all flex items-center justify-center gap-3">
                                    {loading ? <><Loader2 className="animate-spin" /> {t('reg_creating')}</> : <>{t('reg_btn_finish')} <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
