import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import wishlistReducer from './wishlistSlice';

const persistConfig = {
    key: "root",
    storage,
    whitelist: ['auth', 'cart', 'wishlist'], 
};

const rootReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    devTools: process.env.NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/PURGE"],
                ignoredPaths: ["result"], 
            },
        }),
});

export const persistor = persistStore(store);