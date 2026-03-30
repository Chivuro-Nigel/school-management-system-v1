import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/admin-sidebar";

interface Stats {
  students: number;
  teachers: number;
  classes: number;
  subjects: number;
}

const AdminDash = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/academics/dashboard-stats/",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Show a skeleton or loading state
  if (loading)
    return (
      <AdminLayout>
        <div className="p-8">Loading Overview...</div>
      </AdminLayout>
    );

  return (
    <AdminLayout>
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900">
            System Overview
          </h1>
          <p className="text-slate-500">
            Global summary of your school's academic data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Students Card */}
          <StatCard
            title="Enrolled Students"
            value={stats?.students || 0}
            color="blue"
          />

          {/* Teachers Card */}
          <StatCard
            title="Active Teachers"
            value={stats?.teachers || 0}
            color="indigo"
          />

          {/* Classes Card */}
          <StatCard
            title="Total Classes"
            value={stats?.classes || 0}
            color="amber"
          />

          {/* Subjects Card */}
          <StatCard
            title="Subjects Offered"
            value={stats?.subjects || 0}
            color="rose"
          />
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Shortcut to Teachers Management */}
            <button
              onClick={() => navigate("/teachers")}
              className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-indigo-500 hover:shadow-md transition group text-left"
            >
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
                <span className="text-xl">👨‍🏫</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Manage Faculty
                </p>
                <p className="text-xs text-slate-500">View & Add Teachers</p>
              </div>
            </button>

            {/* Shortcut to Students Management */}
            <button
              onClick={() => navigate("/students")}
              className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 hover:border-blue-500 hover:shadow-md transition group text-left"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
                <span className="text-xl">🎓</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Manage Students
                </p>
                <p className="text-xs text-slate-500">Enrollment & Records</p>
              </div>
            </button>

            {/* Add more as needed... */}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Reusable Sub-component for clean code
const StatCard = ({
  title,
  value,
  color,
  trend,
}: {
  title: string;
  value: number;
  color: string;
  trend?: string;
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className={`p-3 bg-${color}-50 text-${color}-600 rounded-xl`}>
        <div className="w-6 h-6 bg-current rounded-md opacity-20"></div>
      </div>
      {trend && (
        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
          {trend}
        </span>
      )}
    </div>
    <div className="mt-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {title}
      </p>
      <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
        {value.toLocaleString()}
      </h3>
    </div>
  </div>
);

export default AdminDash;
