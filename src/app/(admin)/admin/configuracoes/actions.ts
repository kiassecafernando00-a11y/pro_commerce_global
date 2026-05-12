
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateSystemSettings(formData: FormData) {
    const appName = formData.get("appName") as string
    const platformFeePercent = Number(formData.get("platformFeePercent"))
    const vendorRegistrationFee = Number(formData.get("vendorRegistrationFee"))
    const maintenanceMode = formData.get("maintenanceMode") === "on"
    const supportEmail = formData.get("supportEmail") as string
    const supportPhone = formData.get("supportPhone") as string
    const address = formData.get("address") as string
    const workingHours = formData.get("workingHours") as string

    const socialFacebook = formData.get("socialFacebook") as string
    const socialInstagram = formData.get("socialInstagram") as string
    const socialLinkedin = formData.get("socialLinkedin") as string
    const socialTiktok = formData.get("socialTiktok") as string
    const socialYoutube = formData.get("socialYoutube") as string

    const policyTerms = formData.get("policyTerms") as string
    const policyPrivacy = formData.get("policyPrivacy") as string

    // Feature Flags
    const enableReviews = formData.get("enableReviews") === "on"
    const enableBlog = formData.get("enableBlog") === "on"
    const enableDigitalProducts = formData.get("enableDigitalProducts") === "on"

    // Analytics
    const googleAnalyticsId = formData.get("googleAnalyticsId") as string
    const facebookPixelId = formData.get("facebookPixelId") as string

    // Mobile Apps
    const appStoreUrl = formData.get("appStoreUrl") as string
    const googlePlayUrl = formData.get("googlePlayUrl") as string

    // Institutional Info
    const companyMission = formData.get("companyMission") as string
    const companyVision = formData.get("companyVision") as string
    const companyValues = formData.get("companyValues") as string

    // Careers
    const careersIntro = formData.get("careersIntro") as string
    const careersBenefits = formData.get("careersBenefits") as string

    // Footer
    const footerSlogan = formData.get("footerSlogan") as string
    const footerCopyright = formData.get("footerCopyright") as string

    // Upsert ensuring ID is always "global"
    await prisma.systemConfig.upsert({
        where: { id: "global" },
        update: {
            appName,
            platformFeePercent,
            vendorRegistrationFee,
            maintenanceMode,

            supportEmail,
            supportPhone,
            address,
            workingHours,

            socialFacebook,
            socialInstagram,
            socialLinkedin,
            socialTiktok,
            socialYoutube,

            policyTerms,
            policyPrivacy,

            enableReviews,
            enableBlog,
            enableDigitalProducts,
            googleAnalyticsId,
            facebookPixelId,

            appStoreUrl,
            googlePlayUrl,

            // Institutional Info
            companyMission,
            companyVision,
            companyValues,

            // Careers
            careersIntro,
            careersBenefits,

            // Footer
            footerSlogan,
            footerCopyright
        },
        create: {
            id: "global",
            appName,
            platformFeePercent,
            vendorRegistrationFee,
            maintenanceMode,

            supportEmail,
            supportPhone,
            address,
            workingHours,

            socialFacebook,
            socialInstagram,
            socialLinkedin,
            socialTiktok,
            socialYoutube,

            policyTerms,
            policyPrivacy,

            enableReviews,
            enableBlog,
            enableDigitalProducts,
            googleAnalyticsId,
            facebookPixelId,

            appStoreUrl,
            googlePlayUrl,

            companyMission,
            companyVision,
            companyValues,

            careersIntro,
            careersBenefits,

            // Footer
            footerSlogan,
            footerCopyright
        }
    })

    revalidatePath("/admin/configuracoes")
    return { success: true }
}
