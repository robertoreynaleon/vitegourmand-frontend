// Service de géolocalisation et calcul des frais de livraison
// API utilisée : adresse.data.gouv.fr (gratuite, sans clé API)
// Basé sur geoloc.js du projet viteandgourmand, réécrit en TypeScript

const BORDEAUX_LAT = 44.837789;
const BORDEAUX_LON = -0.57918;
const BASE_FEE = 5.0;       // 5 € de base
const PRICE_PER_KM = 0.59;  // 0,59 € / km

export interface DeliveryResult {
    success: true;
    city: string;
    distance: number;      // en km, arrondi à 1 décimale
    deliveryFee: number;   // en €, arrondi à 2 décimales
    isBordeaux: boolean;
}

export interface DeliveryError {
    success: false;
    error: string;
}

export type DeliveryResponse = DeliveryResult | DeliveryError;

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// Formule de Haversine : distance à vol d'oiseau entre deux points GPS
function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Géocode une adresse et calcule les frais de livraison depuis Bordeaux
export async function calculateDeliveryFee(
    address: string
): Promise<DeliveryResponse> {
    try {
        const response = await fetch(
            `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const result = data.features[0];
            const [lon, lat] = result.geometry.coordinates as [number, number];
            const city: string =
                result.properties.city || result.properties.name;

            const distance = calculateDistance(
                BORDEAUX_LAT,
                BORDEAUX_LON,
                lat,
                lon
            );

            // Dans Bordeaux (< 5 km du centre) : tarif de base uniquement
            const isBordeaux =
                distance <= 5 || city.toLowerCase().includes('bordeaux');
            const deliveryFee = isBordeaux
                ? BASE_FEE
                : BASE_FEE + distance * PRICE_PER_KM;

            return {
                success: true,
                city,
                distance: Math.round(distance * 10) / 10,
                deliveryFee: Math.round(deliveryFee * 100) / 100,
                isBordeaux,
            };
        }

        return {
            success: false,
            error: 'Adresse non trouvée. Veuillez vérifier votre saisie.',
        };
    } catch {
        return {
            success: false,
            error: "Erreur de connexion à l'API. Veuillez réessayer.",
        };
    }
}
