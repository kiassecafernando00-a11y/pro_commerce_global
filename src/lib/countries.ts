export interface Country {
    name: string;
    code: string;
    dialCode: string;
    region: 'Africa' | 'Europe' | 'Americas' | 'Asia' | 'Oceania';
}

export const countries: Country[] = [
    // Africa
    { name: "Angola", code: "AO", dialCode: "+244", region: "Africa" },
    { name: "África do Sul", code: "ZA", dialCode: "+27", region: "Africa" },
    { name: "Namíbia", code: "NA", dialCode: "+264", region: "Africa" },
    { name: "Moçambique", code: "MZ", dialCode: "+258", region: "Africa" },
    { name: "Cabo Verde", code: "CV", dialCode: "+238", region: "Africa" },
    { name: "São Tomé e Príncipe", code: "ST", dialCode: "+239", region: "Africa" },
    { name: "Guiné-Bissau", code: "GW", dialCode: "+245", region: "Africa" },
    { name: "Nigéria", code: "NG", dialCode: "+234", region: "Africa" },
    { name: "Egito", code: "EG", dialCode: "+20", region: "Africa" },
    { name: "Marrocos", code: "MA", dialCode: "+212", region: "Africa" },
    { name: "Quênia", code: "KE", dialCode: "+254", region: "Africa" },

    // Europe
    { name: "Portugal", code: "PT", dialCode: "+351", region: "Europe" },
    { name: "Espanha", code: "ES", dialCode: "+34", region: "Europe" },
    { name: "França", code: "FR", dialCode: "+33", region: "Europe" },
    { name: "Alemanha", code: "DE", dialCode: "+49", region: "Europe" },
    { name: "Reino Unido", code: "GB", dialCode: "+44", region: "Europe" },
    { name: "Itália", code: "IT", dialCode: "+39", region: "Europe" },
    { name: "Suíça", code: "CH", dialCode: "+41", region: "Europe" },

    // Americas
    { name: "Brasil", code: "BR", dialCode: "+55", region: "Americas" },
    { name: "Estados Unidos", code: "US", dialCode: "+1", region: "Americas" },
    { name: "Canadá", code: "CA", dialCode: "+1", region: "Americas" },
    { name: "Argentina", code: "AR", dialCode: "+54", region: "Americas" },
    { name: "México", code: "MX", dialCode: "+52", region: "Americas" },

    // Asia
    { name: "China", code: "CN", dialCode: "+86", region: "Asia" },
    { name: "Japão", code: "JP", dialCode: "+81", region: "Asia" },
    { name: "Coreia do Sul", code: "KR", dialCode: "+82", region: "Asia" },
    { name: "Índia", code: "IN", dialCode: "+91", region: "Asia" },
    { name: "Emirados Árabes Unidos", code: "AE", dialCode: "+971", region: "Asia" },
];

export const getCountryByCode = (code: string) => countries.find(c => c.code === code);
export const getCountryByName = (name: string) => countries.find(c => c.name === name);
