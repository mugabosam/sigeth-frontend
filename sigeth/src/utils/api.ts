import axios from "axios";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach access token ──
api.interceptors.request.use(
    (config) => {
        // Skip auth header for login/refresh — stale tokens cause 401
        const url = config.url ?? "";
        if (url.includes("/auth/login") || url.includes("/auth/refresh")) {
            return config;
        }
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ── Response interceptor: handle 401 → refresh or logout ──
let isRefreshing = false;
let failedQueue: {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null) => {
    failedQueue.forEach((p) => {
        if (token) p.resolve(token);
        else p.reject(error);
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Only attempt refresh on 401 and not already retried
        if (error.response?.status !== 401 || original._retry) {
            return Promise.reject(error);
        }

        // Don't try to refresh the refresh-token or login endpoints
        if (
            original.url?.includes("/auth/refresh/") ||
            original.url?.includes("/auth/login/")
        ) {
            if (original.url?.includes("/auth/refresh/")) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("sigeth_user");
                window.location.href = "/";
            }
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Queue requests while a refresh is in progress
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                original.headers.Authorization = `Bearer ${token}`;
                return api(original);
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) throw new Error("No refresh token");

            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
                refresh: refreshToken,
            });

            const newAccess: string = data.access;
            const newRefresh: string | undefined = data.refresh;

            localStorage.setItem("access_token", newAccess);
            if (newRefresh) localStorage.setItem("refresh_token", newRefresh);

            processQueue(null, newAccess);
            original.headers.Authorization = `Bearer ${newAccess}`;
            return api(original);
        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("sigeth_user");
            window.location.href = "/";
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

export default api;
