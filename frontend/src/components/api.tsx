import axios from "axios";

// This pulls the URL from Vercel/Local .env and adds the /api/ suffix
const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${BASE_URL}/api/`,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors (Expired Tokens)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          // Use the dynamic BASE_URL here too!
          const res = await axios.post(`${BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          if (res.status === 200) {
            const newAccess = res.data.access;
            localStorage.setItem("access_token", newAccess);

            api.defaults.headers.common["Authorization"] =
              `Bearer ${newAccess}`;
            originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.clear();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
