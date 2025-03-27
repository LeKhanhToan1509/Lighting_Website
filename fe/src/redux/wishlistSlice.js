import { createSlice } from '@reduxjs/toolkit';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    wishlist: []
  },
  reducers: {
    addToWishlist: (state, action) => {
      const existingProductIndex = state.wishlist.findIndex(
        item => item._id === action.payload._id
      );

      if (existingProductIndex === -1) {
        state.wishlist.push(action.payload);
      }
    },
    deleteFromWishlist: (state, action) => {
      state.wishlist = state.wishlist.filter(
        item => item._id !== action.payload._id
      );
    }
  }
});

export const { addToWishlist, deleteFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;