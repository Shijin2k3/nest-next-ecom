import { CartItem } from "@/types/cart.type";
import { useSelector } from "react-redux";

export function useCart() {
  const reduxCart = useSelector((state: any) => state.cart);
  const items: CartItem[] = reduxCart.items;

  return {
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: reduxCart.totalPrice,
  };
}
