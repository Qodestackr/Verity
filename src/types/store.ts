export interface Store {
  id: string
  name: string
  image: string
  rating: number
  reviewCount: number
  deliveryTime: string
  deliveryFee: number
  distance: number
  isFavorite: boolean
  categories: string[]
  tags: string[]
  isOpen: boolean
  isFeatured?: boolean
  isNew?: boolean
  promoText?: string
  products?: Array<{
    id: string
    name: string
    category: string
    price: number
    stock: number
    tags: string[]
    abv: number
    origin: string
    popularity: number
    margin: number
  }>
}
