import { useState, useEffect } from "react";
import Papa from "papaparse";
import AdminLayout from "./admin-sidebar";
import api from "./api";

const Students = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  //Fetch Data
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("students/list/");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- 2. Update Student ---
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Capture all fields, including the ones we just added to the serializer
    const updatedData = {
      name: formData.get("name"),
      email: formData.get("email"),
      user_id: formData.get("user_id"),
      class_name: formData.get("class_name"),
      national_id: formData.get("national_id"),
      date_of_birth: formData.get("date_of_birth"),
      home_address: formData.get("home_address"),
      guardian_name: formData.get("guardian_name"),
      guardian_email: formData.get("guardian_email"),
      guardian_contact: formData.get("guardian_contact"),
      status: formData.get("status"),
    };

    try {
      const response = await api.patch(
        `students/update/${selectedStudent.id}/`,
        updatedData,
      );
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudent.id ? { ...s, ...response.data } : s,
        ),
      );
      setIsEditModalOpen(false);
      alert("Student updated successfully!");
    } catch (error: any) {
      console.error("Update failed:", error.response?.data);
      alert("Error updating student. Check console for details.");
    }
  };

  // --- 3. Add New Student ---
  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Correctly handle multiple select values
    const subjects = formData.getAll("enrolled_subjects");
    const payload = {
      ...Object.fromEntries(formData.entries()),
      enrolled_subjects: subjects,
    };

    try {
      const response = await api.post("students/create/", payload);
      setStudents((prev) => [response.data, ...prev]);
      setIsAddModalOpen(false);
      alert("Student created successfully!");
    } catch (error: any) {
      const errorData = error.response?.data;
      alert(
        "Error: " +
          (errorData ? JSON.stringify(errorData) : "Something went wrong"),
      );
    }
  };

  // --- 4. Bulk CSV Upload ---
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const formattedData = results.data.map((row: any) => {
            const rawDate = row.date_of_birth
              ? String(row.date_of_birth).trim()
              : "";
            let finalDate = null;

            if (rawDate.includes("/")) {
              const parts = rawDate.split("/");
              if (parts.length === 3) {
                const day = parts[0].padStart(2, "0");
                const month = parts[1].padStart(2, "0");
                const year = parts[2];
                finalDate = `${year}-${month}-${day}`;
              }
            } else {
              finalDate = rawDate.replace(/[^0-9-]/g, "") || null;
            }

            return {
              ...row,
              date_of_birth: finalDate,
              enrolled_subjects:
                typeof row.enrolled_subjects === "string"
                  ? row.enrolled_subjects
                      .split(",")
                      .map((s: string) => s.trim())
                      .filter(Boolean)
                  : [],
            };
          });

          const response = await api.post(
            "students/bulk-create/",
            formattedData,
          );
          alert(`Successfully imported ${response.data.count} students!`);
          setIsBulkModalOpen(false);
          fetchStudents(); // Refresh list without page reload
        } catch (err: any) {
          console.error("Backend Errors:", err.response?.data);
          alert("Upload failed. Check the console for row-specific errors.");
        }
      },
    });
  };

  // --- 5. Delete Student ---
  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await api.delete(`students/delete/${id}/`);
        setStudents((prev) => prev.filter((s) => s.id !== id));
      } catch (error: any) {
        console.error("Delete failed:", error.response?.data);
        alert("Failed to delete student.");
      }
    }
  };

  // --- 6. Client-side Filtering ---
  const filteredStudents = (students || []).filter((student: any) => {
    const search = searchTerm.toLowerCase().trim();
    const studentName = (student?.name || "").toLowerCase();
    const studentID = (student?.user_id || "").toLowerCase();

    const matchesSearch =
      studentName.includes(search) || studentID.includes(search);
    const matchesGrade =
      !filterGrade || String(student?.class_name) === filterGrade;
    const matchesStatus =
      !filterStatus ||
      student?.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="p-8 bg-slate-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Student Enrollment
            </h1>
            <p className="text-slate-500">
              Manage, filter, and update student records
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 bg-white rounded-xl flex items-center gap-2 font-semibold transition"
            >
              📤 Bulk Upload
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span> Add Student
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 mb-6 items-center">
          <div className="flex-1 min-w-75 relative">
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
          </div>
          <select
            className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-600 outline-none"
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
          >
            <option value="">All Grades</option>
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <option key={g} value={g}>
                Form {g}
              </option>
            ))}
          </select>
          <select
            className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-600 outline-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800 text-slate-100">
              <tr>
                <th className="p-4 font-semibold text-sm">Student ID</th>
                <th className="p-4 font-semibold text-sm">Full Name</th>
                <th className="p-4 font-semibold text-sm">Class</th>
                <th className="p-4 font-semibold text-sm">Status</th>
                <th className="p-4 font-semibold text-sm text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    // Makes the whole row clickable
                    onClick={() => {
                      setSelectedStudent(student);
                      setIsViewModalOpen(true);
                    }}
                    // cursor-pointer shows the hand icon; group allows styling children on hover
                    className="hover:bg-slate-50 transition cursor-pointer group"
                  >
                    <td className="p-4 text-sm font-medium text-slate-700">
                      #{student.user_id?.toUpperCase()}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {student.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {student.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {student.class_name}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          student?.status?.toLowerCase() === "active"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-700 border-red-100"
                        }`}
                      >
                        {student?.status || "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents the "View" modal from opening
                          setSelectedStudent(student);
                          setIsEditModalOpen(true);
                        }}
                        className="z-10 relative text-blue-600 hover:text-blue-800 font-semibold px-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents the "View" modal from opening
                          handleDelete(student.id);
                        }}
                        className="z-10 relative text-red-600 hover:text-red-800 font-semibold px-2"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 border-b pb-2">
                Edit Student Profile
              </h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                {/* Basic Info Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Full Name
                    </label>
                    <input
                      name="name"
                      defaultValue={selectedStudent.name}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Student ID
                    </label>
                    <input
                      name="user_id"
                      defaultValue={selectedStudent.user_id}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Email
                    </label>
                    <input
                      name="email"
                      defaultValue={selectedStudent.email}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Class
                    </label>
                    <select
                      name="class_name"
                      defaultValue={selectedStudent.class_name}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="1">Form 1</option>
                      <option value="2">Form 2</option>
                      <option value="3">Form 3</option>
                      <option value="4">Form 4</option>
                    </select>
                  </div>
                </div>

                {/* Identity Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      National ID
                    </label>
                    <input
                      name="national_id"
                      defaultValue={selectedStudent.national_id}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      defaultValue={selectedStudent.date_of_birth}
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Home Address
                  </label>
                  <input
                    name="home_address"
                    defaultValue={selectedStudent.home_address}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                {/* Guardian Row */}
                <div className="bg-slate-50 p-3 rounded-lg space-y-3">
                  <p className="text-sm font-bold text-slate-700">
                    Guardian Details
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      name="guardian_name"
                      placeholder="Name"
                      defaultValue={selectedStudent.guardian_name}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                    <input
                      name="guardian_contact"
                      placeholder="Contact"
                      defaultValue={selectedStudent.guardian_contact}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>
                  <input
                    name="guardian_email"
                    placeholder="Guardian Email"
                    defaultValue={selectedStudent.guardian_email}
                    className="w-full p-2 border rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Account Status
                  </label>
                  <select
                    name="status"
                    defaultValue={selectedStudent.status}
                    className="w-full p-2 border rounded-lg bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition"
                  >
                    Update Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Add New Student</h2>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    name="first_name"
                    placeholder="First Name"
                    required
                    className="p-2 border rounded-lg w-full"
                  />
                  <input
                    name="last_name"
                    placeholder="Last Name"
                    required
                    className="p-2 border rounded-lg w-full"
                  />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  required
                  className="p-2 border rounded-lg w-full"
                />
                <label className="text-sm font-bold text-slate-600">
                  National ID
                </label>
                <input
                  type="text"
                  name="national_id"
                  placeholder="national id"
                  required
                  className="p-2 border rounded-lg w-full"
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    required
                    className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    Format: YYYY-MM-DD
                  </p>
                </div>
                <input
                  name="user_id"
                  placeholder="Student ID"
                  required
                  className="p-2 border rounded-lg w-full"
                />
                <select
                  name="class_name"
                  required
                  className="p-2 border rounded-lg w-full"
                >
                  <option value="">Select Class</option>
                  <option value="1">Form 1</option>
                  <option value="2">Form 2</option>
                </select>
                <select
                  name="enrolled_subjects"
                  multiple
                  required
                  className="w-full p-2 border rounded-lg h-32"
                >
                  <option value="mathematics">Mathematics</option>
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                </select>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Home Address
                  </label>
                  <input
                    name="home_address"
                    placeholder="123 Street, Suburb"
                    className="p-2 border rounded-lg w-full"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">
                      Guardian Name
                    </label>
                    <input
                      name="guardian_name"
                      placeholder="Full Name"
                      className="p-2 border rounded-lg w-full"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-slate-700">
                      Guardian Contact
                    </label>
                    <input
                      name="guardian_contact"
                      placeholder="Phone Number"
                      className="p-2 border rounded-lg w-full"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700">
                    Guardian Email
                  </label>
                  <input
                    name="guardian_email"
                    type="email"
                    placeholder="guardian@example.com"
                    className="p-2 border rounded-lg w-full"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulk Modal */}
        {isBulkModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold mb-2">Bulk Upload</h2>
              <p className="text-sm text-slate-500 mb-4">
                Select a CSV file to import students.
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="block w-full text-sm mb-6"
              />

              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 mb-6 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-lg">
                    📁
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-900 uppercase">
                      Template Required
                    </p>
                    <p className="text-[10px] text-indigo-600">
                      Use our format to avoid errors
                    </p>
                  </div>
                </div>

                <a
                  href="/templates/Student_Bulk_Upload.csv"
                  download="Student_Bulk_Upload_Template.csv"
                  className="bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 px-4 py-2 rounded-lg text-xs font-bold border border-indigo-200 shadow-sm transition-all duration-200 active:scale-95"
                >
                  Download CSV
                </a>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {isViewModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-10000 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-slate-400">
                    Student ID: {selectedStudent.user_id?.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="text-2xl hover:text-slate-300"
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </p>
                  <p className="text-slate-900 font-medium">
                    {selectedStudent.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Current Class
                  </p>
                  <p className="text-slate-900 font-medium">
                    {selectedStudent.class_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Date of Birth
                  </p>
                  <p className="text-slate-900 font-medium">
                    {selectedStudent.date_of_birth || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                      selectedStudent.status?.toLowerCase() === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedStudent.status || "Inactive"}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Enrolled Subjects
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.enrolled_subjects?.length > 0 ? (
                      selectedStudent.enrolled_subjects.map(
                        (sub: any, i: number) => {
                          // If backend sends strings, 'subjectText' is 'sub'
                          // If backend sends objects, 'subjectText' is 'sub.name'
                          const subjectText =
                            typeof sub === "string"
                              ? sub
                              : sub.name || "Unknown";

                          return (
                            <span
                              key={i}
                              className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-sm border border-slate-200"
                            >
                              {/* Capitalize the first letter */}
                              {subjectText.charAt(0).toUpperCase() +
                                subjectText.slice(1)}
                            </span>
                          );
                        },
                      )
                    ) : (
                      <span className="text-slate-400 italic">
                        No subjects enrolled
                      </span>
                    )}
                  </div>
                  <div className="border-t border-slate-100 pt-6 mb-8">
                    <h3 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4">
                      Personal Identity
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          National ID
                        </p>
                        <p className="text-slate-900 font-medium">
                          {selectedStudent.national_id || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Date of Birth
                        </p>
                        <p className="text-slate-900 font-medium">
                          {selectedStudent.date_of_birth || "—"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Home Address
                        </p>
                        <p className="text-slate-900 font-medium">
                          {selectedStudent.home_address ||
                            selectedStudent.address ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6 mb-8">
                    <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest mb-4">
                      Guardian & Emergency
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Guardian Name
                        </p>
                        <p className="text-slate-900 font-medium">
                          {selectedStudent.guardian_name || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Contact Number
                        </p>
                        <p className="text-slate-900 font-medium">
                          {selectedStudent.guardian_contact ||
                            selectedStudent.guardian_phone ||
                            "—"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs font-bold text-slate-400 uppercase">
                          Guardian Email
                        </p>
                        <p className="text-slate-900 font-medium">
                          {selectedStudent.guardian_email || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-4 border-t flex justify-end sticky bottom-0 z-10">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="bg-slate-900 text-white px-6 py-2 rounded-xl font-semibold hover:bg-slate-800 transition"
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

export default Students;
