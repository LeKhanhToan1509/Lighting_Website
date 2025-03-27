import axios from 'axios';

const BE_DOMAIN = "http://localhost:5000";

const axiosInstance = axios.create({
    baseURL: BE_DOMAIN,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

const refreshToken = async () => {
    try {
        const res = await axiosInstance.post('/refresh-token', {});
        return res.data;
    } catch (err) {
        throw new Error('Unable to refresh token');
    }
};

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { accessToken } = await refreshToken();
                axiosInstance.defaults.headers.common['token'] = `Bearer ${accessToken}`;
                originalRequest.headers['token'] = `Bearer ${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;