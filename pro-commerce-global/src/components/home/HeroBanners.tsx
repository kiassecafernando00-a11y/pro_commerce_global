"use client"

import { useState, useEffect } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

interface Banner {
    id: string
    title: string | null
    imageUrl: string
    link: string | null
}

export default function HeroBanners({ banners }: { banners: Banner[] }) {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (banners.length <= 1) return
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % banners.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [banners.length])

    if (!banners || banners.length === 0) return null // Fallback if no banners

    const prev = () => setCurrent(curr => (curr === 0 ? banners.length - 1 : curr - 1))
    const next = () => setCurrent(curr => (curr + 1) % banners.length)

    return (
        <section className="relative overflow-hidden bg-gray-900 h-[500px] md:h-[600px] flex items-center group">
            {banners.map((banner, index) => (
                <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                >
                    <img
                        src={banner.imageUrl}
                        alt={banner.title || "Banner"}
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>

                    <div className="container mx-auto px-6 h-full flex items-center relative z-20">
                        <div className="max-w-3xl">
                            {banner.title && (
                                <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-xl animate-in slide-in-from-bottom-6 duration-700">
                                    {banner.title}
                                </h2>
                            )}
                            {banner.link && (
                                <a href={banner.link} className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-all hover:-translate-y-1">
                                    Saiba Mais <ArrowRight className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {banners.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${idx === current ? "bg-blue-500 w-8" : "bg-white/50 hover:bg-white"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    )
}
