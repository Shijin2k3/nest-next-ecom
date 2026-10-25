import { CartSlice } from "@/types/cart.type";
import { createSlice } from "@reduxjs/toolkit";

const initialState: CartSlice = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
});

export const {} = cartSlice.actions;
export default cartSlice.reducer;
