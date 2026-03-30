import { useState, useEffect } from "react";
import api from "./api";
import AdminLayout from "../components/admin-sidebar";

const Settings = () => {
  const [formData, setFormData] = useState({
    school_name: "",
    motto: "",
    postal_address: "",
    establishment_date: "",
    mascot_name: "",
    contact_email: "",
    phone_number: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    // 2. Use 'api' and remove the full URL
    api
      .get("core/school-info/")
      .then((res) => {
        setFormData(res.data);
        setPreview(res.data.school_logo);
      })
      .catch((err) => {
        console.error("Error fetching school info:", err);
        // The interceptor in api.ts will handle session issues automatically
      });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, (formData as any)[key] || "");
    });

    if (logoFile) {
      data.append("school_logo", logoFile);
    }

    try {
      await api.put("core/school-info/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("School settings updated successfully!");
    } catch (err: any) {
      console.error("Server Error:", err.response?.data);
      alert("Update failed. Check console for details.");
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            School Configuration
          </h1>
          <p className="text-slate-500">
            Update your institution's public profile and branding.
          </p>
        </div>

        <form
          onSubmit={handleUpdate}
          className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100"
        >
          {/* Branding Section */}
          <section>
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">
              Branding
            </h2>
            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl">
              <div className="relative">
                {preview ? (
                  <img
                    src={preview}
                    className="w-24 h-24 object-contain bg-white border-2 border-dashed rounded-xl"
                    alt="School Logo Preview"
                  />
                ) : (
                  /* If preview is null or empty, render the placeholder */
                  <div className="w-24 h-24 bg-slate-100 flex items-center justify-center rounded-xl text-xs text-slate-400 border-2 border-dashed border-slate-200">
                    No Logo
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  School Logo
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Recommended: Square PNG or SVG with transparent background.
                </p>
              </div>
            </div>
          </section>

          {/* General Information */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">
                Identity
              </h2>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                Official School Name
              </label>
              <input
                value={formData.school_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, school_name: e.target.value })
                }
                className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="e.g. St. Peter's Academy"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                School Motto
              </label>
              <input
                value={formData.motto || ""}
                onChange={(e) =>
                  setFormData({ ...formData, motto: e.target.value })
                }
                className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="e.g. Excellence Through Hard Work"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                Establishment Date
              </label>
              <input
                type="date"
                value={formData.establishment_date || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    establishment_date: e.target.value,
                  })
                }
                className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                Mascot Name
              </label>
              <input
                value={formData.mascot_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, mascot_name: e.target.value })
                }
                className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="e.g. The Golden Lions"
              />
            </div>
          </section>

          {/* Contact Information */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
            <div className="md:col-span-2">
              <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4">
                Contact Details
              </h2>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.contact_email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
                className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="admin@school.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                Phone Number
              </label>
              <input
                value={formData.phone_number || ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                className="p-3 border rounded-xl w-full focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="+1 234 567 890"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-sm font-semibold text-slate-600 ml-1">
                Postal Address
              </label>
              <textarea
                value={formData.postal_address || ""}
                onChange={(e) =>
                  setFormData({ ...formData, postal_address: e.target.value })
                }
                className="p-3 border rounded-xl w-full h-24 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Enter full physical address..."
              />
            </div>
          </section>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-10 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              Update Configuration
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Settings;
