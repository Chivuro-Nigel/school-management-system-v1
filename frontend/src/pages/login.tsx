import "../css/login.css";
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

function Login() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    interface LoginResponse {
      access: string;
      refresh: string;
      user_id: string;
      role: string;
      first_name: string;
      last_name: string;
      has_changed_password: boolean;
    }
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post<LoginResponse>(
        "http://127.0.0.1:8000/api/accounts/login/",
        {
          user_id: userId,
          password: password,
        },
      );
      console.log("Login Success: ", response.data);

      localStorage.setItem("refresh_token", response.data.refresh);

      const userData = {
        user_id: response.data.user_id, // Ensure this matches your Context's User interface
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        role: response.data.role,
        has_changed_password: response.data.has_changed_password,
      };

      // 3. CALL THE CONTEXT LOGIN (This replaces your manual localStorage sets)
      login(userData, response.data.access);

      // 4. Handle Navigation
      const hasChanged = response.data.has_changed_password;
      const role = response.data.role?.toLowerCase();

      if (hasChanged === false && role !== "admin") {
        navigate("/set-password");
      } else if (role === "student") {
        console.log("Navigating to student dash...");
        navigate("/student-dash");
      } else if (role === "admin") {
        navigate("/admin-dash");
      } else if (role === "teacher") {
        navigate("/teacher-dash");
      } else {
        console.error("Unknown role:", response.data.role);
      }
    } catch (err: any) {
      console.error("Operation failed", err);

      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        // Check for 'detail' (standard DRF) or 'error' first
        const message =
          responseData.detail ||
          responseData.error ||
          responseData[Object.keys(responseData)[0]];
        setError(Array.isArray(message) ? message[0] : String(message));
      } else {
        // 2. Fallback for generic errors
        setError(err.message || "An unexpected error occurred");
      }
    }
  };

  return (
    <div className="login-page-container min-h-screen w-full flex items-center justify-center p-4">
      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
        {/*Header*/}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            School Portal
          </h1>
          <p className="text-blue-100/70 mt-2 text-sm">
            Please enter your credentials to sign in.
          </p>
        </div>

        {/* Error Message Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 p-2 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        {/*Inputs*/}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-blue-50 mb-1.5 ml-1 text-left">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              autoComplete="username"
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. B252562A"
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200/50 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-50 mb-1.5 ml-1 text-left">
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="enter password..."
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-blue-200/50 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="cursor-pointer w-full bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transform transition active:scale-[0.98]"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-blue-100/60 mt-8">
          <Link
            to="/reset-password"
            className="hover:text-blue-400 transition-colors"
          >
            <span className="text-sm uppercase tracking-widest opacity-70">
              Reset Password
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
export default Login;
