import { Product } from "./product.type";

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  product: Product;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartSlice {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}
