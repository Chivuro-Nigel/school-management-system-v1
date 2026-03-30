import { useState, useEffect } from "react";
import AdminLayout from "./admin-sidebar";
import api from "./api";

// 1. Updated Interfaces to match your current Django Models
interface Subject {
  id: number;
  name: string;
}

interface ClassSection {
  id: number;
  name: string;
  room_number: number | null;
  grade_level: number;
}

const AcademicManagement = () => {
  const [activeTab, setActiveTab] = useState<"classes" | "subjects">("classes");
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 2. Using a specific union type for better IntelliSense
  const [editingItem, setEditingItem] = useState<ClassSection | Subject | null>(
    null,
  );

  const fetchData = async () => {
    try {
      const [classRes, subjectRes] = await Promise.all([
        api.get("academics/classes/"),
        api.get("academics/subjects/"),
      ]);
      setClasses(classRes.data);
      setSubjects(subjectRes.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLoadDefaults = async () => {
    const defaultSubjects = [
      "Mathematics",
      "English Language",
      "Physics",
      "Chemistry",
      "Biology",
      "Geography",
      "Physical Education",
      "Computer Science",
    ];

    if (
      !window.confirm("This will add standard subjects to your list. Continue?")
    )
      return;

    try {
      await Promise.all(
        defaultSubjects.map((name) =>
          api.post("academics/subjects/", { name }),
        ),
      );
      fetchData();
    } catch (err) {
      alert("Note: Some subjects might already exist.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    // 3. Payload Logic updated for the "New" model structure
    let payload: Partial<ClassSection | Subject> = {};

    if (activeTab === "classes") {
      payload = {
        name: rawData.name as string,
        room_number: rawData.room_number ? Number(rawData.room_number) : null,
        grade_level: Number(rawData.grade_level) || 1,
      };
    } else {
      payload = {
        name: rawData.name as string,
      };
    }

    const endpoint =
      activeTab === "classes" ? "academics/classes/" : "academics/subjects/";

    try {
      if (editingItem) {
        await api.patch(`${endpoint}${editingItem.id}/`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      fetchData();
      closeModal();
    } catch (err) {
      alert("Error saving. Check console for details.");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${activeTab.slice(0, -1)}?`,
      )
    )
      return;
    const endpoint =
      activeTab === "classes" ? "academics/classes/" : "academics/subjects/";
    try {
      await api.delete(`${endpoint}${id}/`);
      fetchData();
    } catch (err) {
      alert("Delete failed. This item might be linked to other records.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Academic{" "}
              <span className="text-slate-300 font-light">Structure</span>
            </h1>
            <div className="flex gap-6 mt-4">
              <button
                onClick={() => setActiveTab("classes")}
                className={`text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "classes" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                Class Sections
              </button>
              <button
                onClick={() => setActiveTab("subjects")}
                className={`text-sm font-bold uppercase tracking-widest transition-all ${activeTab === "subjects" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                Subject List
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            {activeTab === "subjects" && (
              <button
                onClick={handleLoadDefaults}
                className="bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-bold hover:bg-blue-100 transition-all border border-blue-100"
              >
                📥 Load Defaults
              </button>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg active:scale-95"
            >
              + Create {activeTab === "classes" ? "Section" : "Subject"}
            </button>
          </div>
        </div>

        {/* List View Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "classes"
            ? classes.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-slate-900">
                      {cls.name}
                    </h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingItem(cls);
                          setIsModalOpen(true);
                        }}
                        className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id)}
                        className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <p className="text-sm font-medium text-slate-400">
                      Room:{" "}
                      <span className="text-slate-900 font-bold">
                        {cls.room_number ?? "Unassigned"}
                      </span>
                    </p>
                  </div>
                </div>
              ))
            : subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group"
                >
                  <h3 className="text-lg font-bold text-slate-800">
                    {sub.name}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button
                      onClick={() => {
                        setEditingItem(sub);
                        setIsModalOpen(true);
                      }}
                      className="text-sm font-bold text-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-sm font-bold text-rose-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
        </div>

        {/* Empty State */}
        {activeTab === "subjects" && subjects.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-400 mb-4">Your subject list is empty.</p>
            <button
              onClick={handleLoadDefaults}
              className="text-blue-600 font-bold hover:underline"
            >
              Load standard subjects
            </button>
          </div>
        )}

        {/* Modal Form */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl">
              <h2 className="text-3xl font-black text-slate-900 mb-8">
                {editingItem ? "Update" : "Create"}{" "}
                <span className="text-blue-600">
                  {activeTab === "classes" ? "Section" : "Subject"}
                </span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === "classes" ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                        Section Name
                      </label>
                      <input
                        name="name"
                        defaultValue={editingItem?.name}
                        required
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                        Grade Level
                      </label>
                      <input
                        name="grade_level"
                        type="number"
                        placeholder="e.g. 10"
                        defaultValue={
                          (editingItem as ClassSection)?.grade_level || ""
                        }
                        required
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                        Room Number
                      </label>
                      <input
                        name="room_number"
                        type="number"
                        defaultValue={
                          (editingItem as ClassSection)?.room_number || ""
                        }
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">
                      Subject Name
                    </label>
                    <input
                      name="name"
                      defaultValue={editingItem?.name}
                      required
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 p-4 font-bold text-slate-500 hover:bg-slate-100 rounded-3xl"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex-2 px-8 py-4 font-bold bg-slate-900 text-white rounded-3xl hover:bg-blue-600 transition-all"
                  >
                    {editingItem ? "Save Changes" : "Confirm & Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AcademicManagement;
