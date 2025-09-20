export interface Store {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  distance: number;
  isFavorite: boolean;
  categories: string[];
  tags: string[];
  isOpen: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  promoText?: string;
}
