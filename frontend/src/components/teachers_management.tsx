import AdminLayout from "./admin-sidebar";
import { useEffect, useState } from "react";
import api from "./api";

interface Teacher {
  id: number;
  user: {
    // The actual User data
    user_id: string;
    first_name: string;
    last_name: string;
    personal_email: string;
    is_active: boolean;
  };
  subjects: string[];
  national_id?: string;
  date_of_birth?: string;
  classes?: string[];
}

interface SchoolClass {
  id: number;
  name: string;
  grade_level: string; // Add this line
  room_number?: string;
}

const Teachers = () => {
  // 1. ALL HOOKS MUST BE AT THE TOP
  const [teacherList, setTeacherList] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
  const [classesList, setClasses] = useState<SchoolClass[]>([]);

  const [addFormData, setAddFormData] = useState({
    subjects: [] as string[],
    classes: [] as string[],
  });

  // 2. FETCH DATA ON LOAD
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teachersRes, subjectRes, classRes] = await Promise.all([
          api.get("teachers/list"),
          api.get("academics/subjects/"),
          api.get("academics/classes/"),
        ]);
        setTeacherList(teachersRes.data);
        setSubjects(subjectRes.data);
        setClasses(classRes.data);
      } catch (error) {
        console.error("Initialization Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 3. HANDLERS
  const handleCreateTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const getStr = (name: string) => (formData.get(name) as string) || "";

    const payload = {
      user: {
        user_id: getStr("user_id"),
        first_name: getStr("first_name"),
        last_name: getStr("last_name"),
        personal_email: getStr("email"),
        phone_number: getStr("phone_number"),
        password: "DefaultPassword123!",
      },
      national_id: getStr("national_id"),
      date_of_birth: getStr("date_of_birth"),
      subjects: addFormData.subjects,
      classes: addFormData.classes,
    };

    try {
      const response = await api.post("teachers/create/", payload);
      setTeacherList((prev) => [response.data, ...prev]);
      setIsAddModalOpen(false);
      alert("Teacher created successfully!");
    } catch (error: any) {
      alert("Error: " + JSON.stringify(error.response?.data || "Check fields"));
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const classesArray = formData.getAll("classes").map((c) => c.toString());

    const payload = {
      user: {
        first_name: formData.get("first_name"),
        last_name: formData.get("last_name"),
        user_id: formData.get("user_id"),
        personal_email: formData.get("personal_email"),
        is_active: formData.get("is_active") === "true",
      },
      subjects: formData
        .get("subject")
        ?.toString()
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      classes: classesArray,
      national_id: formData.get("national_id"),
      date_of_birth: formData.get("date_of_birth"),
    };

    try {
      const response = await api.patch(
        `teachers/${selectedTeacher?.user.user_id}/update/`,
        payload,
      );
      setTeacherList((prev) =>
        prev.map((t) =>
          t.user.user_id === selectedTeacher?.user.user_id ? response.data : t,
        ),
      );
      setIsEditModalOpen(false);
      alert("Update successful!");
    } catch (error: any) {
      alert("Failed! Error: " + JSON.stringify(error.response?.data));
    }
  };

  const handleDeleteTeacher = async (userId: string) => {
    if (
      window.confirm(`Are you sure you want to delete this teacher record?`)
    ) {
      try {
        await api.delete(`teachers/${userId}/delete/`);
        setTeacherList((prev) => prev.filter((t) => t.user.user_id !== userId));
        setIsViewModalOpen(false);
        alert("Deleted successfully.");
      } catch (error: any) {
        alert("Error: Could not delete record.");
      }
    }
  };

  // 4. FILTERING LOGIC (With Safety Guards)
  const filteredTeachers = teacherList.filter((teacher) => {
    const query = searchQuery.toLowerCase();
    const matchesName =
      teacher.user?.first_name?.toLowerCase().includes(query) ||
      teacher.user?.last_name?.toLowerCase().includes(query) ||
      teacher.user?.user_id?.toLowerCase().includes(query);

    const matchesSubject =
      teacher.subjects?.some((sub) => sub.toLowerCase().includes(query)) ??
      false;
    return matchesName || matchesSubject;
  });

  // 5. LOADING CHECK (After all hooks)
  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="text-lg font-semibold animate-pulse text-indigo-600">
            Loading Data...
          </div>
        </div>
      </AdminLayout>
    );
  }
  return (
    <AdminLayout>
      <div className="p-8 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Department Management
            </h1>
            <p className="text-slate-500">
              Assign subjects, manage departments, and track teacher workloads.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 shadow-md transition flex items-center gap-2"
          >
            <span>+</span> Add New Teacher
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-75 relative">
            <input
              type="text"
              placeholder="Search by name, ID, or subjects..."
              value={searchQuery} // Bind state
              onChange={(e) => setSearchQuery(e.target.value)} // Update state
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
            />
            <span className="absolute left-3 top-2.5 opacity-50">🔍</span>
          </div>
        </div>

        {/* Teacher Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse table-fixed">
            {/* Added table-fixed for consistent widths */}
            <thead className="bg-slate-800 text-slate-100">
              <tr>
                <th className="p-4 font-semibold text-sm w-1/4">Teacher</th>
                <th className="p-4 font-semibold text-sm w-1/6">Department</th>
                <th className="p-4 font-semibold text-sm w-1/4">
                  Assigned Classes
                </th>
                <th className="p-4 font-semibold text-sm w-1/6">Status</th>
                <th className="p-4 font-semibold text-sm text-right w-1/6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher: Teacher) => (
                  <tr
                    key={teacher.user.user_id}
                    // Opens the View Modal
                    onClick={() => {
                      setSelectedTeacher(teacher);
                      setIsViewModalOpen(true);
                    }}
                    className="hover:bg-slate-50/80 transition cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {teacher.user.first_name} {teacher.user.last_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          ID: {teacher.user.user_id}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-slate-600">
                      No department yet
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects.map((sub, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        ● Active
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        className="text-red-600 hover:underline text-sm font-medium relative z-10 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTeacher(teacher.user.user_id); // Pass the ID directly from the teacher object
                        }}
                      >
                        Delete
                      </button>
                      <button
                        className="text-indigo-600 hover:underline text-sm font-medium relative z-10"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents row click
                          setSelectedTeacher(teacher);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-slate-500 italic"
                  >
                    No teachers found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/*edit modal component*/}
        {isEditModalOpen && selectedTeacher && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-4">
                Edit Teacher: {selectedTeacher.user.first_name}
              </h2>

              <form
                onSubmit={handleUpdateTeacher}
                className="space-y-4 max-h-[80vh] overflow-y-auto p-2"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      First Name
                    </label>
                    <input
                      name="first_name"
                      defaultValue={selectedTeacher.user.first_name}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Last Name
                    </label>
                    <input
                      name="last_name"
                      defaultValue={selectedTeacher.user.last_name}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    User ID
                  </label>
                  <input
                    name="user_id"
                    defaultValue={selectedTeacher.user.user_id}
                    className="w-full p-2 border rounded-lg bg-slate-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Subjects (Comma separated)
                  </label>
                  <select
                    name="subject"
                    multiple
                    defaultValue={selectedTeacher.subjects}
                    className="w-full p-2 border rounded-lg h-32 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Personal Email
                  </label>
                  <input
                    name="personal_email"
                    type="email"
                    defaultValue={selectedTeacher.user.personal_email}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* National ID */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      National ID
                    </label>
                    <input
                      name="national_id"
                      defaultValue={selectedTeacher.national_id}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  {/* Date of Birth */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Date of Birth
                    </label>
                    <input
                      name="date_of_birth"
                      type="date"
                      defaultValue={selectedTeacher.date_of_birth}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Classes Field */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Classes (Comma separated)
                  </label>
                  <select
                    name="classes"
                    multiple
                    defaultValue={selectedTeacher.classes} // This works if your API now sends ["1P", "4M"]
                    className="w-full p-2 border rounded-lg h-32 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {classesList.map((cls: any) => (
                      <option
                        key={cls.id}
                        value={`${cls.grade_level}${cls.name}`}
                      >
                        {cls.grade_level}
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                    Account Status
                  </label>
                  <select
                    name="is_active"
                    defaultValue={
                      selectedTeacher.user.is_active ? "true" : "false"
                    }
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add New Teacher Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Faculty Member</h2>
              <form onSubmit={handleCreateTeacher} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="first_name"
                    placeholder="First Name"
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                  <input
                    name="last_name"
                    placeholder="Last Name"
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <input
                  name="user_id"
                  placeholder="Teacher ID (e.g., TCH-05)"
                  required
                  className="w-full p-2 border rounded-lg"
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Personal Email"
                  required
                  className="w-full p-2 border rounded-lg"
                />

                <input
                  name="phone_number"
                  type="tel"
                  placeholder="Phone Number"
                  required
                  className="w-full p-2 border rounded-lg"
                />

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    National ID
                  </label>
                  <input
                    name="national_id"
                    placeholder="e.g. 63-123456-X-01"
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Date of Birth
                  </label>
                  <input
                    name="date_of_birth"
                    type="date"
                    required
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Assign Subjects
                    </label>
                    <select
                      multiple
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500"
                      value={addFormData.subjects} // This should be an array: ["Mathematics", "Physics"]
                      onChange={(e) => {
                        const values = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        );
                        setAddFormData({ ...addFormData, subjects: values });
                      }}
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.name}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hold Ctrl (or Cmd) to select multiple
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Assign Classes
                  </label>
                  <select
                    multiple
                    className="w-full p-2 border rounded h-24 text-black"
                    // Use the state you created earlier
                    onChange={(e) =>
                      setAddFormData({
                        ...addFormData,
                        classes: Array.from(
                          e.target.selectedOptions,
                          (o) => o.value,
                        ),
                      })
                    }
                  >
                    {classesList.map((classObj) => (
                      <option key={classObj.id} value={classObj.name}>
                        {/* Combine the Grade/Level and the Name here */}
                        {classObj.grade_level} {classObj.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Hold Ctrl/Cmd to select multiple
                  </p>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create Teacher
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Teacher Detail Modal */}
        {isViewModalOpen && selectedTeacher && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-1000 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    {selectedTeacher.user.first_name}{" "}
                    {selectedTeacher.user.last_name}
                  </h2>
                  <p className="text-indigo-100 opacity-80">
                    Faculty ID: {selectedTeacher.user.user_id}
                  </p>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-white hover:text-indigo-200 text-3xl leading-none"
                >
                  &times;
                </button>
              </div>

              {/* Content */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Email Address
                  </p>
                  <p className="text-slate-900 font-semibold">
                    {selectedTeacher.user.personal_email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Account Status
                  </p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {selectedTeacher.user.is_active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    National ID
                  </p>
                  <p className="text-slate-900 font-semibold">
                    {selectedTeacher.national_id || "Not Provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Date of Birth
                  </p>
                  <p className="text-slate-900 font-semibold">
                    {selectedTeacher.date_of_birth || "Not Provided"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Teaching Subjects
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeacher.subjects.length > 0 ? (
                      selectedTeacher.subjects.map((sub, i) => (
                        <span
                          key={i}
                          className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-sm font-medium capitalize"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">
                        No subjects assigned yet
                      </span>
                    )}
                  </div>

                  <div className="md:col-span-2 border-t pt-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                      Assigned Classes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTeacher.classes &&
                      selectedTeacher.classes.length > 0 ? (
                        selectedTeacher.classes.map((cls, i) => (
                          <span
                            key={i}
                            className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 text-sm font-medium"
                          >
                            {cls}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">
                          No classes assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-4 border-t flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl font-semibold hover:bg-slate-800 transition shadow-lg"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Teachers;
