import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/sidebar";
import "../css/student-dash.css";
import Calendar from "../components/calendar";

import Footer from "../components/footer";
import api from "../components/api";

const StudentDash = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const storedUser = localStorage.getItem("user");

    // 1. Kick out unauthenticated users
    if (!token) {
      navigate("/login");
      return;
    }

    // 2. Hydrate state from localStorage for instant UI loading
    if (storedUser && !user) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Malformed storage", e);
      }
    }

    // 3. Fetch fresh data from the server
    const fetchProfile = async () => {
      try {
        const response = await api.get("accounts/profile/");
        setUser(response.data);
        localStorage.setItem("user", JSON.stringify(response.data));
      } catch (err: any) {
        console.error("Session expired or server error", err);

        if (err.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchProfile();
  }, [navigate]); // navigate is stable, this runs once on mount

  if (!user) return <div>LOADING.....</div>;

  // Helper component
  const DetailItem = ({ label, value, isStatus }: any) => (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
        {label}
      </span>
      {isStatus ? (
        <span className="flex items-center gap-2 text-lg font-bold text-emerald-600">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          {value}
        </span>
      ) : (
        <span className="text-lg font-semibold text-slate-700">
          {value || "—"}
        </span>
      )}
    </div>
  );

  const ProfileField = ({ label, value, color }: any) => {
    const colors: any = {
      blue: "bg-blue-50 text-blue-600",
      indigo: "bg-indigo-50 text-indigo-600",
      rose: "bg-rose-50 text-rose-600",
      amber: "bg-amber-50 text-amber-600",
      emerald: "bg-emerald-50 text-emerald-600",
      pink: "bg-pink-50 text-pink-600",
      orange: "bg-orange-50 text-orange-600",
      cyan: "bg-cyan-50 text-cyan-600",
    };

    return (
      <div className="group/field transition-all duration-300 hover:translate-y-0.5">
        <div className="flex items-center gap-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover/field:scale-110 ${colors[color]}`}
          >
            {/* You can replace these with actual Heroicons or Lucide-react icons */}
            <div className="w-5 h-5 border-2 border-current rounded-sm opacity-80" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-400 mb-0.5">
              {label}
            </p>
            <p className="text-[15px] font-bold text-slate-800 leading-tight">
              {value || "—"}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      {/* Main Container */}
      <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC]">
        {/* LEFT COLUMN: Profile Content */}
        <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-baseline gap-4">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
                      {user.first_name} {user.last_name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-bold rounded-full uppercase tracking-wider">
                      {user.role}
                    </span>
                    <span className="text-lg font-medium text-slate-400">
                      ID: #{user.user_id}
                    </span>
                  </div>
                </div>

                {/* Quick Stats Card */}
              </div>
            </div>

            {/* Info Grid */}
            <div className="flex flex-col w-full">
              <div className="relative overflow-hidden bg-white rounded-[3rem] p-8 lg:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 group">
                {/* Animated Background Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-linear-to-br from-blue-50/50 to-transparent rounded-full -mr-32 -mt-32 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>

                <div className="relative z-10">
                  {/* 1. Header Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Student Profile
                      </h2>
                      <p className="text-slate-400 font-medium mt-1">
                        Verified record for academic year 2026
                      </p>
                    </div>

                    {/* Floating Stats - This is the "Status/Level" bar from your design */}
                    <div className="flex items-center gap-6 bg-slate-50/50 backdrop-blur-sm p-4 rounded-2xl border border-slate-100">
                      <DetailItem
                        label="Current Level"
                        value={user.class_level || "Not Assigned"}
                      />
                      <div className="w-px h-8 bg-slate-200"></div>
                      <DetailItem
                        label="Status"
                        value={user.is_active ? "Enrolled" : "Inactive"}
                        isStatus
                      />
                    </div>
                  </div>

                  {/* 2. Personal Identification Section */}
                  <div className="mb-16">
                    <div className="flex items-center gap-4 mb-10">
                      <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] whitespace-nowrap">
                        Personal Identity
                      </span>
                      <div className="h-px flex-1 bg-blue-100"></div>
                    </div>

                    {/* The Grid: Changed to 1 col on mobile, 2 on tablet, 4 on desktop */}
                    <div className="flex flex-col gap-3">
                      <ProfileField
                        icon="phone"
                        label="Direct Line"
                        value={user.phone_number}
                        color="blue"
                      />
                      <ProfileField
                        icon="mail"
                        label="Institutional Email"
                        value={user.personal_email}
                        color="indigo"
                      />
                      <ProfileField
                        icon="calendar"
                        label="Birth Registry"
                        value={user.date_of_birth}
                        color="rose"
                      />
                      <ProfileField
                        icon="map"
                        label="Primary Residence"
                        value={user.primary_address}
                        color="amber"
                      />
                    </div>
                  </div>

                  {/* 3. Guardian & Support Section */}
                  <div>
                    <div className="flex items-center gap-4 mb-10">
                      <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] whitespace-nowrap">
                        Guardian & Support
                      </span>
                      <div className="h-px flex-1 bg-emerald-100"></div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <ProfileField
                        icon="user"
                        label="Legal Guardian"
                        value={user.guardian_name}
                        color="emerald"
                      />
                      <ProfileField
                        icon="heart"
                        label="Relationship"
                        value={user.guardian_relation || "Parent"}
                        color="pink"
                      />
                      <ProfileField
                        icon="phone"
                        label="Emergency Contact"
                        value={user.guardian_phone}
                        color="orange"
                      />
                      <ProfileField
                        icon="shield"
                        label="Guardian Email"
                        value={user.guardian_email}
                        color="cyan"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future sections like "Academic Performance" or "Attendance" can go here */}
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="w-full lg:w-100 bg-slate-50 border-l border-slate-200 p-8 space-y-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Calendar />
          </div>
        </div>
      </div>

      <Footer />
    </Layout>
  );
};

export default StudentDash;
