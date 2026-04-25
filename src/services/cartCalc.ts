// Calculs du panier et persistance dans localStorage
// Basé sur cart-show.js du projet viteandgourmand, réécrit en TypeScript

export interface CartItem {
    menuId: number;
    menuTitle: string;
    pricePerPerson: number;
    minPeople: number;
    advanceOrderDays: number;
    quantity: number;
}

// Réduction de 10 % lorsque la quantité dépasse minPeople + 5
export const DISCOUNT_THRESHOLD = 5;
export const DISCOUNT_RATE = 0.1;

const CART_KEY         = 'vg_cart';
// Clé stockant le timestamp Unix (ms) au-delà duquel le panier est considéré expiré
const CART_EXPIRES_KEY = 'vg_cart_expires_at';
// Durée de vie du panier : 2 heures en millisecondes
const CART_TTL_MS      = 2 * 60 * 60 * 1000;

// ─── Calculs ──────────────────────────────────────────────────────────────────

/** Retourne true si la quantité dépasse le seuil de réduction (minPeople + 5). */
export function hasDiscount(item: CartItem): boolean {
    return item.quantity > item.minPeople + DISCOUNT_THRESHOLD;
}

/** Calcule le sous-total d'un article avant application de la réduction. */
export function subtotalBeforeDiscount(item: CartItem): number {
    return item.pricePerPerson * item.quantity;
}

/** Calcule le sous-total d'un article après application éventuelle de la réduction. */
export function subtotal(item: CartItem): number {
    const base = subtotalBeforeDiscount(item);
    return hasDiscount(item) ? base * (1 - DISCOUNT_RATE) : base;
}

/** Calcule le sous-total de tous les articles du panier (sans livraison). */
export function cartSubtotal(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + subtotal(item), 0);
}

/** Calcule le total final du panier en ajoutant les frais de livraison. */
export function cartTotal(items: CartItem[], deliveryFee: number): number {
    return cartSubtotal(items) + deliveryFee;
}

/** Formate un prix numérique en chaîne lisible (ex. « 12,50 € »). */
export function formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',') + ' €';
}

// ─── Persistance localStorage ─────────────────────────────────────────────────

/** Charge le panier depuis localStorage. Retourne un tableau vide en cas d'erreur de parsing. */
/** Si le panier a dépassé sa durée de vie de 2 heures, il est purgé automatiquement. */
export function loadCart(): CartItem[] {
    try {
        // Vérifier l'expiration avant de lire le contenu
        const expiresAt = localStorage.getItem(CART_EXPIRES_KEY);
        if (expiresAt && Date.now() > Number(expiresAt)) {
            // Panier expiré (plus de 2h) : purge automatique
            localStorage.removeItem(CART_KEY);
            localStorage.removeItem(CART_EXPIRES_KEY);
            return [];
        }
        const raw = localStorage.getItem(CART_KEY);
        return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
        return [];
    }
}

/** Sauvegarde le panier dans localStorage (remplace le panier précédent). Renouvelle l'expiration à 2h. */
export function saveCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    // Renouveler le TTL à chaque modification du panier
    localStorage.setItem(CART_EXPIRES_KEY, String(Date.now() + CART_TTL_MS));
}

/**
 * Ajoute un article au panier. Si un article avec le même menuId existe déjà,
 * il est remplacé (mise à jour de la quantité). Retourne le panier mis à jour.
 */
export function addToCart(newItem: CartItem): CartItem[] {
    const items = loadCart();
    const index = items.findIndex((i) => i.menuId === newItem.menuId);
    if (index >= 0) {
        items[index] = newItem;
    } else {
        items.push(newItem);
    }
    saveCart(items);
    return items;
}

/** Supprime l'article correspondant au menuId du panier. Retourne le panier mis à jour. */
export function removeFromCart(menuId: number): CartItem[] {
    const items = loadCart().filter((i) => i.menuId !== menuId);
    saveCart(items);
    return items;
}

/** Met à jour la quantité d'un article du panier identifié par son menuId. Retourne le panier mis à jour. */
export function updateCartQuantity(menuId: number, quantity: number): CartItem[] {
    const items = loadCart().map((i) =>
        i.menuId === menuId ? { ...i, quantity } : i
    );
    saveCart(items);
    return items;
}

/** Vide complètement le panier en supprimant l'entrée localStorage et son timestamp d'expiration. */
export function clearCart(): void {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(CART_EXPIRES_KEY);
}
