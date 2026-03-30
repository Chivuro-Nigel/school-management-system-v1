import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Basic Client-side Validation
    if (data.new_password !== data.confirm_password) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      setLoading(false);
      return;
    }

    try {
      await api.post("accounts/identity-reset/", {
        user_id: data.user_id, // Changed from reg_number to match your form input 'name'
        national_id: data.national_id,
        date_of_birth: data.dob, // Ensure this matches the backend 'date_of_birth'
        new_password: data.new_password,
      });

      setMessage({
        type: "success",
        text: "Password reset successful! Redirecting...",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        "Verification failed. Please check your details.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Reset <span className="text-blue-600">Password</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Verify your identity to continue
          </p>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-2xl text-sm font-bold ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity Fields */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              User ID
            </label>
            <input
              name="user_id"
              type="text"
              required
              placeholder="enter your unique user id"
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              National ID
            </label>
            <input
              name="national_id"
              type="text"
              required
              placeholder="Enter your ID number"
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              Date of Birth
            </label>
            <input
              name="dob"
              type="date"
              required
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <hr className="border-slate-100 my-6" />

          {/* New Password Fields */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              New Password
            </label>
            <input
              name="new_password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-2">
              Confirm Password
            </label>
            <input
              name="confirm_password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Update Password"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-all"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
