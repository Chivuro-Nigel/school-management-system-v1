import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
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
          const res = await axios.post(
            "http://127.0.0.1:8000/api/token/refresh/",
            {
              refresh: refreshToken,
            },
          );

          if (res.status === 200) {
            const newAccess = res.data.access;
            localStorage.setItem("access_token", newAccess);

            // 1. Update defaults for future requests
            api.defaults.headers.common["Authorization"] =
              `Bearer ${newAccess}`;

            // 2. CRITICAL: Update the header for the CURRENT request we are about to retry
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
