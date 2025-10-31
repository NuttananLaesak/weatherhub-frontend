import axios from "axios";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token if login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isLoggingOut: boolean = false;

// handle 401 auto logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // if request is login skip interceptor
    if (originalRequest.url === "/auth/login") {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      const message = error.response.data?.message || "Unauthorized";

      await Swal.fire({
        icon: "warning",
        title: message,
        confirmButtonText: "Logout",
        allowOutsideClick: false,
        allowEscapeKey: false,
        customClass: {
          confirmButton:
            "!bg-red-600 text-white !font-bold px-6 py-3 rounded hover:!bg-red-700",
        },
      });

      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
