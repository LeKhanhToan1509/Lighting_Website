import axios from 'axios';

const BE_DOMAIN = "http://localhost:5000";

const axiosInstance = axios.create({
    baseURL: BE_DOMAIN,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    }
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const refreshToken = async () => {
    try {
        const res = await axiosInstance.post('/refresh-token', {});
        return res.data;
    } catch (err) {
        // Clear user data and redirect to login on refresh token failure
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
    }
};

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['token'] = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { accessToken, user } = await refreshToken();
                axiosInstance.defaults.headers.common['token'] = `Bearer ${accessToken}`;
                originalRequest.headers['token'] = `Bearer ${accessToken}`;
                
                // Update user in localStorage
                if (user) {
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({ ...currentUser, ...user }));
                }

                processQueue(null, accessToken);
                return axiosInstance(originalRequest);
            } catch (err) {
                processQueue(err, null);
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;