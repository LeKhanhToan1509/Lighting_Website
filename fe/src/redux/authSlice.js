import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        login: {
            currentUser: null,
        },
        logout: {
            isFetching: false,
            error: null,
        },
        register: {
            isFetching: false,
            isSuccess: false,
            isError: false,
            sentPin: false,
        },
        pinVerification: {
            isFetching: false,
            isSuccess: false,
            isError: false,
        },
        resetPassWord: {
            isFetching: false,
            isSuccess: false,
            isError: false,
        },
        changePassword: {
            isFetching: false,
            isSuccess: false,
            isError: false,
        }
    },
    reducers: {
        loginStart: (state) => {
            state.login.isFetching = true;
            state.login.error = null;
        },
        loginSuccess: (state, action) => {
            state.login.isFetching = false;
            state.login.currentUser = action.payload;
            state.login.error = null;
        },
        loginFailure: (state) => {
            state.login.isFetching = false;
            state.login.error = true; 
        },
        logoutStart: (state) => {
            state.logout.isFetching = true;
            state.logout.error = null;
        },
        logoutSuccess: (state) => {
            state.logout.isFetching = false;
            state.login.currentUser = null;
            state.logout.error = null;
        },
        logoutFailure: (state) => {
            state.logout.isFetching = false;
            state.logout.error = true;
        },
        registerStart: (state) => {
            state.register.isFetching = true;
            state.register.isError = false;
        },
        registerSuccess: (state) => {
            state.register.isFetching = false;
            state.register.isSuccess = true;
            state.register.isError = false;
            state.register.sentPin = true;
        },
        registerFailure: (state, action) => {
            state.register.isFetching = false;
            state.register.isSuccess = false;
            state.register.isError = true;
        },
        verifyPinStart: (state) => {
            state.pinVerification.isFetching = true;
            state.pinVerification.isSuccess = false;
            state.pinVerification.isError = false;
        },
        verifyPinSuccess: (state) => {
            state.pinVerification.isFetching = false;
            state.pinVerification.isError = false;
            state.pinVerification.isSuccess = true;
        },
        verifyPinFailure: (state) => {
            state.pinVerification.isFetching = false;
            state.pinVerification.isError = true;
        },
        resetPasswordStart: (state) => {
            state.resetPassWord.isFetching = true;
            state.resetPassWord.isError = false;
        },
        resetPasswordSuccess: (state) => {
            state.resetPassWord.isFetching = false;
            state.resetPassWord.isSuccess = true;
            state.resetPassWord.isError = false;
        },
        resetPasswordFailure: (state) => {
            state.resetPassWord.isFetching = false;
            state.resetPassWord.isSuccess = false;
            state.resetPassWord.isError = true;
        },
        changePasswordStart: (state) => {
            state.changePassword.isFetching = true;
            state.changePassword.isError = false;
        },
        changePasswordSuccess: (state) => {
            state.changePassword.isFetching = false;
            state.changePassword.isSuccess = true;
            state.changePassword.isError = false;
        },
        changePasswordFailure: (state) => {
            state.changePassword.isFetching = false;
            state.changePassword.isSuccess = false;
            state.changePassword.isError = true;
        },
    },
});

export const { changePasswordFailure, changePasswordStart, changePasswordSuccess, loginStart, loginSuccess, loginFailure, logoutFailure, logoutStart, logoutSuccess, registerFailure, registerStart, registerSuccess, verifyPinStart, verifyPinFailure, verifyPinSuccess, resetPasswordFailure, resetPasswordStart, resetPasswordSuccess } = authSlice.actions;

export default authSlice.reducer;