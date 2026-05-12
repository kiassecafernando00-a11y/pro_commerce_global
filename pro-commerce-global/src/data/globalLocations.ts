
export interface CountryData {
    name: string
    code: string
    lat: number
    lng: number
    phoneCode?: string
    // Structure: Province -> Municipality -> Bairros[]
    hierarchy?: Record<string, Record<string, string[]>>
}

export const globalLocations: CountryData[] = [
    {
        name: "Angola",
        code: "AO",
        phoneCode: "+244",
        lat: -11.2027,
        lng: 17.8739,
        hierarchy: {
            "Bengo": {
                "Ambriz": ["Centro", "Bela Vista"],
                "Bula Atumba": ["Centro"],
                "Dande": ["Caxito", "Mabubas", "Úcua", "Kicabo", "Barra do Dande"],
                "Dembos": ["Quibaxe"],
                "Nambuangongo": ["Muxaluando"],
                "Pango Aluquém": ["Pango"],
            },
            "Benguela": {
                "Baía Farta": ["Centro", "Dombe Grande"],
                "Balombo": ["Centro"],
                "Benguela": ["Centro", "Benfica", "Casseque", "Zona A", "Zona B", "Zona F"],
                "Bocoio": ["Centro"],
                "Caimbambo": ["Centro"],
                "Catumbela": ["Centro", "Gama", "Luongo"],
                "Chongoroi": ["Centro"],
                "Cubal": ["Centro"],
                "Ganda": ["Centro"],
                "Lobito": ["Restinga", "Compão", "Zona Alta", "Caponte", "Cawango"]
            },
            "Bié": {
                "Andulo": ["Centro"],
                "Camacupa": ["Centro"],
                "Catabola": ["Centro"],
                "Chinguar": ["Centro"],
                "Chitembo": ["Centro"],
                "Cuemba": ["Centro"],
                "Cunhinga": ["Centro"],
                "Cuíto": ["Centro", "Cunje"],
                "Nharea": ["Centro"]
            },
            "Cabinda": {
                "Belize": ["Centro"],
                "Buco-Zau": ["Centro"],
                "Cabinda": ["Centro", "Simulambuco", "Lombo Lombo", "Chibodo"],
                "Cacongo": ["Lândana"]
            },
            "Cuando Cubango": {
                "Calai": ["Centro"],
                "Cuangar": ["Centro"],
                "Cuchi": ["Centro"],
                "Cuito Cuanavale": ["Centro"],
                "Dirico": ["Centro"],
                "Mavinga": ["Centro"],
                "Menongue": ["Centro", "Pandera"],
                "Nancova": ["Centro"],
                "Rivungo": ["Centro"]
            },
            "Cuanza Norte": {
                "Ambaca": ["Camabatela"],
                "Banga": ["Centro"],
                "Bolongongo": ["Centro"],
                "Cambambe": ["Dondo"],
                "Cazengo": ["Ndalatando"],
                "Golungo Alto": ["Centro"],
                "Gonguembo": ["Quilombo dos Dembos"],
                "Lucala": ["Centro"],
                "Quiculungo": ["Centro"],
                "Samba Caju": ["Centro"]
            },
            "Cuanza Sul": {
                "Amboim": ["Gabela"],
                "Cassongue": ["Centro"],
                "Cela": ["Waku Kungo"],
                "Conda": ["Centro"],
                "Ebo": ["Centro"],
                "Libolo": ["Calulo"],
                "Mussende": ["Centro"],
                "Porto Amboim": ["Centro"],
                "Quibala": ["Centro"],
                "Quilenda": ["Centro"],
                "Seles": ["Centro"],
                "Sumbe": ["Centro", "Chingo"]
            },
            "Cunene": {
                "Cahama": ["Centro"],
                "Cuanhama": ["Ondjiva"],
                "Curoca": ["Oncócua"],
                "Cuvelai": ["Centro"],
                "Namacunde": ["Centro"],
                "Ombadja": ["Xangongo"]
            },
            "Huambo": {
                "Bailundo": ["Centro"],
                "Caála": ["Centro"],
                "Catchiungo": ["Centro"],
                "Chinjenje": ["Centro"],
                "Ecunha": ["Centro"],
                "Huambo": ["Cidade Alta", "Cidade Baixa", "Benfica", "São Pedro", "Capango"],
                "Londuimbali": ["Centro"],
                "Longonjo": ["Centro"],
                "Mungo": ["Centro"],
                "Tchicala-Tcholohanga": ["Centro"],
                "Tchindjenje": ["Centro"],
                "Ucuma": ["Centro"]
            },
            "Huíla": {
                "Caconda": ["Centro"],
                "Cacula": ["Centro"],
                "Caluquembe": ["Centro"],
                "Chiange": ["Centro"],
                "Chibia": ["Centro"],
                "Chicomba": ["Centro"],
                "Chipindo": ["Centro"],
                "Cuvango": ["Centro"],
                "Humpata": ["Centro"],
                "Jamba": ["Centro"],
                "Lubango": ["Centro", "Lage", "Senhora do Monte", "Mapunda", "Arimba"],
                "Matala": ["Centro"],
                "Quilengues": ["Centro"],
                "Quipungo": ["Centro"]
            },
            "Luanda": {
                "Belas": ["Talatona", "Benfica", "Futungo", "Ramiros", "Morro dos Veados", "Cidade Universitária", "Camama", "Quifica"],
                "Cacuaco": ["Cacuaco", "Kicolo", "Mulenvos", "Sequele", "Fundan", "Paraíso"],
                "Cazenga": ["Cazenga", "Tala Hady", "Hoji-ya-Henda", "11 de Novembro", "Kalawenda", "Kima Kieza"],
                "Icolo e Bengo": ["Catete", "Bela Vista", "Bom Jesus"],
                "Luanda": ["Ingombota", "Maianga", "Rangel", "Samba", "Sambizanga", "Neves Bendinha", "Maculusso", "Kinaxixi", "Ilha de Luanda", "Miramar", "Alvalade", "Prenda", "Rocha Pinto", "Marçal", "Vila Alice"],
                "Kilamba Kiaxi": ["Golfe 1", "Golfe 2", "Palanca", "Nova Vida", "Sapú", "Havemos de Voltar"],
                "Talatona": ["Talatona", "Benfica", "Lar do Patriota", "Camama", "Cidade Financeira"],
                "Viana": ["Viana", "Estalagem", "Zango 1", "Zango 2", "Zango 3", "Zango 4", "Zango 5 (8000)", "Kikuxi", "Vila Flôr", "Baia", "Calumbo"],
                "Quiçama": ["Muxima", "Cabo Ledo"]
            },
            "Lunda Norte": {
                "Cambulo": ["Centro"],
                "Capenda-Camulemba": ["Centro"],
                "Caungula": ["Centro"],
                "Chitato": ["Dundo"],
                "Cuango": ["Centro"],
                "Cuilo": ["Centro"],
                "Lóvua": ["Centro"],
                "Lubalo": ["Centro"],
                "Lucapa": ["Centro"],
                "Xá-Muteba": ["Centro"]
            },
            "Lunda Sul": {
                "Cacolo": ["Centro"],
                "Dala": ["Centro"],
                "Muconda": ["Centro"],
                "Saurimo": ["Centro", "Terra Nova", "Txizainga"]
            },
            "Malanje": {
                "Cacuso": ["Centro"],
                "Calandula": ["Centro"],
                "Cambundi-Catembo": ["Centro"],
                "Cangandala": ["Centro"],
                "Caombo": ["Centro"],
                "Cuaba Nzogo": ["Centro"],
                "Cunda-Dia-Baze": ["Centro"],
                "Luquembo": ["Centro"],
                "Malanje": ["Centro", "Maxinde", "Vila Matilde"],
                "Marimba": ["Centro"],
                "Massango": ["Centro"],
                "Mucari": ["Centro"],
                "Quela": ["Centro"],
                "Quirima": ["Centro"]
            },
            "Moxico": {
                "Alto Zambeze": ["Cazombo"],
                "Bundas": ["Lumbala Nguimbo"],
                "Camanongue": ["Centro"],
                "Léua": ["Centro"],
                "Luau": ["Centro"],
                "Luacano": ["Centro"],
                "Luchazes": ["Centro"],
                "Cameia": ["Lumeje"],
                "Moxico": ["Luena"]
            },
            "Namibe": {
                "Bibala": ["Centro"],
                "Camacuio": ["Centro"],
                "Moçâmedes": ["Centro", "Torre do Tombo", "Saco A e B"],
                "Tômbua": ["Centro"],
                "Virei": ["Centro"]
            },
            "Uíge": {
                "Ambuíla": ["Centro"],
                "Bembe": ["Centro"],
                "Buengas": ["Centro"],
                "Bungo": ["Centro"],
                "Damba": ["Centro"],
                "Alto Cauale": ["Cangola"],
                "Maquela do Zombo": ["Centro"],
                "Mucaba": ["Centro"],
                "Negage": ["Centro"],
                "Puri": ["Centro"],
                "Quimbele": ["Centro"],
                "Quitexe": ["Centro"],
                "Santa Cruz": ["Milunga"],
                "Sanza Pombo": ["Centro"],
                "Songo": ["Centro"],
                "Uíge": ["Centro", "Candombe"]
            },
            "Zaire": {
                "Cuimba": ["Centro"],
                "M'Banza Kongo": ["Centro", "11 de Novembro"],
                "Noqui": ["Centro"],
                "N'Zeto": ["Centro"],
                "Soyo": ["Centro", "Pangala"],
                "Tomboco": ["Centro"]
            }
        }
    },
    // Other countries (kept simple/flat or empty for now as requested focus is Angola)
    { name: "África do Sul", code: "ZA", phoneCode: "+27", lat: -30.5595, lng: 22.9375 },
    { name: "Moçambique", code: "MZ", phoneCode: "+258", lat: -18.6657, lng: 35.5296 },
    { name: "Nigéria", code: "NG", phoneCode: "+234", lat: 9.0820, lng: 8.6753 },
    { name: "Portugal", code: "PT", phoneCode: "+351", lat: 39.3999, lng: -8.2245 },
    { name: "Espanha", code: "ES", phoneCode: "+34", lat: 40.4637, lng: -3.7492 },
    { name: "França", code: "FR", phoneCode: "+33", lat: 46.2276, lng: 2.2137 },
    { name: "Reino Unido", code: "GB", phoneCode: "+44", lat: 55.3781, lng: -3.4360 },
    { name: "Brasil", code: "BR", phoneCode: "+55", lat: -14.2350, lng: -51.9253 },
    { name: "Estados Unidos", code: "US", phoneCode: "+1", lat: 37.0902, lng: -95.7129 },
    { name: "Canadá", code: "CA", phoneCode: "+1", lat: 56.1304, lng: -106.3468 },
    { name: "China", code: "CN", phoneCode: "+86", lat: 35.8617, lng: 104.1954 },
    { name: "Japão", code: "JP", phoneCode: "+81", lat: 36.2048, lng: 138.2529 },
    { name: "Emirados Árabes Unidos", code: "AE", phoneCode: "+971", lat: 23.4241, lng: 53.8478 }
]

// Helpers updated for new structure
export const getProvinces = (countryName: string) => {
    const country = globalLocations.find(c => c.name === countryName)
    return country?.hierarchy ? Object.keys(country.hierarchy) : []
}

export const getMunicipalities = (countryName: string, provinceName: string) => {
    const country = globalLocations.find(c => c.name === countryName)
    if (!country?.hierarchy?.[provinceName]) return []
    return Object.keys(country.hierarchy[provinceName])
}

export const getBairros = (countryName: string, provinceName: string, municipalityName: string) => {
    const country = globalLocations.find(c => c.name === countryName)
    return country?.hierarchy?.[provinceName]?.[municipalityName] || []
}
