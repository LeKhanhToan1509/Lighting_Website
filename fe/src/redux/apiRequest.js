
import { addProduct, deleteFromCart, updateCartItemQuantity, removeAllFromCart } from './cartSlice';
import { addToWishlist, deleteFromWishlist } from './wishlistSlice';
import { loginStart, loginSuccess, loginFailure, logoutFailure, logoutStart, logoutSuccess } from './authSlice';  
import axiosInstance from '../axiosInstance';

// product
export const addToCart = (product, dispatch) => {
    dispatch(addProduct(product));
}

export const deleteProduct = (id, dispatch) => {
    dispatch(deleteFromCart(id));
}

export const updateProduct = (item, dispatch) => {
    dispatch(updateCartItemQuantity(item));
}

export const removeAllProduct = (dispatch) => {
    dispatch(removeAllFromCart());
}

export const addProductToWishList = (product, dispatch) => {
    dispatch(addToWishlist(product));
}

export const deleteProductFromWishList = (item, dispatch) => {
    dispatch(deleteFromWishlist(item));
}

export const fetchAllProducts = async (token) => {
    try {
        const res = await axiosInstance.get(`/product/all`, {
            headers: {
                "token" : `Bearer ${token}`,
            },
        });
        return res.data;
    } catch (err) {
        console.error(err);
    }
}
export const loginUser = async (user, dispatch, navigate) => {
    dispatch(loginStart());
    try {
        const res = await axiosInstance.post(`/signin`, user);
        dispatch(loginSuccess(res.data));
        navigate("/");
    } catch (err) {
        dispatch(loginFailure());
    }
} 

export const logoutUser = async (user, dispatch, navigate) => {
    dispatch(logoutStart());
    try {
        const res = await axiosInstance.post(`/signout`, {}, {
            headers: {
                "token" : `Bearer ${user.accessToken}`,
            },
        });
        console.log(res.data);
        dispatch(logoutSuccess());
        navigate("/login");
    } catch (err) {
        dispatch(logoutFailure());
    }
}

