import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useShopStore } from '@/store/shop-store'
import { useAuth } from '@clerk/nextjs'

export const useStores = (options: {
  lat?: number
  lng?: number
  category?: string
  sortBy?: 'rating' | 'distance'
  page?: number
} = {}) => {
  const { lat, lng, category, sortBy = 'rating', page = 1 } = options
  
  return useQuery({
    queryKey: ['stores', lat, lng, category, sortBy, page],
    queryFn: async () => {
      const response = await fetch(`/api/shop?lat=${lat}&lng=${lng}&category=${category}&sortBy=${sortBy}&page=${page}`)
      if (!response.ok) throw new Error('Failed to fetch stores')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export const useStore = (storeId: string, options: {
  category?: string
  sortBy?: 'price' | 'rating'
  page?: number
} = {}) => {
  const { category, sortBy = 'price', page = 1 } = options
  
  return useQuery({
    queryKey: ['store', storeId, category, sortBy, page],
    queryFn: async () => {
      const response = await fetch(`/api/shop/${storeId}?category=${category}&sortBy=${sortBy}&page=${page}`)
      if (!response.ok) throw new Error('Failed to fetch store')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export const useFavoriteStore = () => {
  const queryClient = useQueryClient()
  const { userId } = useAuth()
  
  return useMutation({
    mutationFn: async (storeId: string) => {
      const response = await fetch('/api/shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId })
      })
      
      if (!response.ok) throw new Error('Failed to update favorite store')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] })
    }
  })
}

export const useVisitStore = () => {
  const { userId } = useAuth()
  const currentStore = useShopStore(state => state.currentStore)
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      if (!currentStore) return
      
      const response = await fetch(`/api/shop/${currentStore}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) throw new Error('Failed to update store visit')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store', currentStore] })
    }
  })
}
