import { useCurrency } from "@/hooks/useCurrency";
import { ProductListQuery } from "@/gql/graphql";

export interface SaleorProduct {
  id: string;
  name: string;
  pricing?: {
    priceRange?: {
      start?: {
        gross?: {
          amount: number;
        };
      };
    };
  };
  thumbnail?: {
    url: string;
    alt?: string;
  };
  // Add other fields as needed
}

export interface POSProduct {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  barcode?: string;
  isPopular?: boolean;
  salesRank?: number;
}

export type ProductNode = NonNullable<
  NonNullable<ProductListQuery["products"]>["edges"][0]
>["node"];
