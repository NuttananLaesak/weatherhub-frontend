import { useState, useEffect } from "react";
import api from "../../api/axios";
import { AxiosError } from "axios";
import type { LoginResponse } from "../../types/auth";
import { useNavigate } from "react-router-dom";
import { showError } from "../../utils/sweetAlert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState(""); // สำหรับจุด …
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const message = error.response?.data?.message || "Login failed";
      showError({
        title: "Login Failed",
        text: message,
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      setDots(""); // รีเซ็ตจุดหลังโหลดเสร็จ
    }
  };

  // Effect สำหรับวนจุด …
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500); // เพิ่มจุดทุก 0.5 วินาที
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Login
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className={`
              w-full 
              bg-blue-600      
              text-white 
              font-medium 
              py-2 
              rounded-md 
              transition 
              duration-300 
              flex items-center justify-center
              ${
                loading ? "cursor-not-allowed opacity-70" : "hover:bg-blue-700 "
              }
            `}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? `Logging in${dots}` : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
