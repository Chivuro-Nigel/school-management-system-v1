import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const SetUpPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "http://127.0.0.1:8000/api/accounts/complete-setup/",
        { password },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // 1. Update the local context so the ProtectedRoute lets them through
      updateUser({ has_changed_password: true });

      const role = user?.role?.toLowerCase();

      if (role === "student") {
        navigate("/student-dash");
      } else if (role === "admin") {
        navigate("/admin-dash");
      } else if (role === "teacher") {
        navigate("/teacher-dash");
      } else {
        console.error("Unknown role:", role);
        // Optional fallback
        navigate("/login");
      }

      // 2. Send them to the dashboard
      alert("Password updated successfully!");
      navigate("/admin-dash");
    } catch (err) {
      const axiosError = err as AxiosError<{
        error?: string;
        password?: string[];
      }>;

      if (axiosError.response && axiosError.response.data) {
        const data = axiosError.response.data;
        // Now TypeScript knows 'data' might have 'error' or 'password'
        const serverMsg =
          data.error || (data.password ? data.password[0] : null);
        setError(serverMsg || "Failed to update password.");
      } else {
        setError("Network error.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Secure Your Account
        </h2>
        <p className="text-slate-500 mb-6 text-sm">
          You're using a temporary password. Please create a new one to continue
          to your dashboard.
        </p>

        {error && (
          <div
            style={{
              color: "red",
              backgroundColor: "#fee2e2",
              padding: "10px",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
          >
            Update & Enter Dashboard
          </button>
        </form>

        <button
          onClick={logout}
          className="w-full mt-4 text-sm text-slate-400 hover:text-slate-600 transition"
        >
          Cancel and Logout
        </button>
      </div>
    </div>
  );
};

export default SetUpPassword;
