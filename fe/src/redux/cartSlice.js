

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
  isFetching: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addProduct: (state, action) => {
      const existingItem = state.cart.find(
        (item) => item._id === action.payload._id && item.color === action.payload.color
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.cart.push({ ...action.payload, quantity: action.payload.quantity || 1 });
      }
    },
    deleteFromCart: (state, action) => {
      const { id, color } = action.payload;
      state.cart = state.cart.filter((item) => !(item._id === id && item.color === color));
    },
    updateCartItemQuantity: (state, action) => {
      const { id, quantity, color } = action.payload;
      const item = state.cart.find((item) => item._id === id && item.color === color);
      if(item) {
        item.quantity = quantity;
      }
      
    },
    removeAllFromCart: (state) => {
      state.cart = [];
    },
    
  },
});

export const { addProduct, deleteFromCart, updateCartItemQuantity, addToWishlist, deleteFromWishlist, removeAllFromCart } = cartSlice.actions;
export default cartSlice.reducer;

