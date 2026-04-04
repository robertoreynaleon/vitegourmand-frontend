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

const CART_KEY = 'vg_cart';

// ─── Calculs ──────────────────────────────────────────────────────────────────

export function hasDiscount(item: CartItem): boolean {
    return item.quantity > item.minPeople + DISCOUNT_THRESHOLD;
}

export function subtotalBeforeDiscount(item: CartItem): number {
    return item.pricePerPerson * item.quantity;
}

export function subtotal(item: CartItem): number {
    const base = subtotalBeforeDiscount(item);
    return hasDiscount(item) ? base * (1 - DISCOUNT_RATE) : base;
}

export function cartSubtotal(items: CartItem[]): number {
    return items.reduce((acc, item) => acc + subtotal(item), 0);
}

export function cartTotal(items: CartItem[], deliveryFee: number): number {
    return cartSubtotal(items) + deliveryFee;
}

export function formatPrice(price: number): string {
    return price.toFixed(2).replace('.', ',') + ' €';
}

// ─── Persistance localStorage ─────────────────────────────────────────────────

export function loadCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
        return [];
    }
}

export function saveCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// Ajoute ou remplace un item (même menuId = mise à jour)
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

export function removeFromCart(menuId: number): CartItem[] {
    const items = loadCart().filter((i) => i.menuId !== menuId);
    saveCart(items);
    return items;
}

export function updateCartQuantity(menuId: number, quantity: number): CartItem[] {
    const items = loadCart().map((i) =>
        i.menuId === menuId ? { ...i, quantity } : i
    );
    saveCart(items);
    return items;
}

export function clearCart(): void {
    localStorage.removeItem(CART_KEY);
}
