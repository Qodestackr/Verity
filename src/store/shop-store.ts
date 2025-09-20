import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface ShopState {
  currentStore: string | null
  favoriteStores: string[]
  cart: {
    items: Array<{
      productId: string
      quantity: number
      price: number
      name: string
    }>
    total: number
  }
  setStore: (store: string) => void
  toggleFavorite: (storeId: string) => void
  addToCart: (item: {
    productId: string
    quantity: number
    price: number
    name: string
  }) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      currentStore: null,
      favoriteStores: [],
      cart: {
        items: [],
        total: 0
      },
      setStore: (store) => set({ currentStore: store }),
      toggleFavorite: (storeId) => set((state) => ({
        favoriteStores: state.favoriteStores.includes(storeId)
          ? state.favoriteStores.filter(id => id !== storeId)
          : [...state.favoriteStores, storeId]
      })),
      addToCart: (item) => set((state) => {
        const existingItem = state.cart.items.find(i => i.productId === item.productId)
        if (existingItem) {
          return {
            cart: {
              items: state.cart.items.map(i => 
                i.productId === item.productId 
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
              total: state.cart.total + (item.price * item.quantity)
            }
          }
        }
        return {
          cart: {
            items: [...state.cart.items, item],
            total: state.cart.total + (item.price * item.quantity)
          }
        }
      }),
      removeFromCart: (productId) => set((state) => {
        const item = state.cart.items.find(i => i.productId === productId)
        if (!item) return state
        
        return {
          cart: {
            items: state.cart.items.filter(i => i.productId !== productId),
            total: state.cart.total - (item.price * item.quantity)
          }
        }
      }),
      clearCart: () => set({ cart: { items: [], total: 0 } })
    }),
    {
      name: 'shop-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
)
