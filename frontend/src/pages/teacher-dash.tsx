import { useState, useEffect } from "react";
import api from "../components/api";
import "../css/teacher.css";

interface Student {
  id: number;
  user_id: string;
  name: string;
}

interface Assignments {
  subjects: string[];
  classes: string[];
}

const MarkEntry = () => {
  const [selectedTerm, setSelectedTerm] = useState("1"); //default term is 1
  const currentYear = new Date().getFullYear().toString();
  const [assignments, setAssignments] = useState<Assignments>({
    subjects: [],
    classes: [],
  });
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [students, setStudents] = useState<Student[]>([]);
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [maxMark, setMaxMark] = useState<number>(100); // Default to 100
  const [loading, setLoading] = useState(false);

  //Fetch Teacher's Assigned Subjects and Classes
  useEffect(() => {
    // No manual token check needed; interceptor handles it
    api
      .get("teachers/my-assignments/")
      .then((res) => {
        console.log("Assignments fetched:", res.data);
        const subjects = Array.isArray(res.data?.subjects)
          ? res.data.subjects
          : [];
        const classes = Array.isArray(res.data?.classes)
          ? res.data.classes
          : [];
        setAssignments({ subjects, classes });

        if (subjects.length > 0) setSelectedSubject(subjects[0]);
        if (classes.length > 0) setSelectedClass(classes[0]);
      })
      .catch((err) => console.error("Error fetching assignments:", err));
  }, []);

  // 2. Fetch Students filtered by the selected Class
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      api
        .get("students/list/", {
          params: {
            class_level: selectedClass,
            subject: selectedSubject,
          },
        })
        .then((res) => setStudents(res.data))
        .catch((err) => console.error("Error fetching students:", err));
    }
  }, [selectedClass, selectedSubject]);

  const handleInputChange = (userId: string, value: string) => {
    setMarks({
      ...marks,
      [userId]: Number(value),
    });
  };

  const submitMarks = async () => {
    const confirmUpdate = window.confirm(
      "This will save or update marks for the selected term. Continue?",
    );
    if (!confirmUpdate) return;

    setLoading(true);
    setLoading(true);

    const payload = Object.keys(marks).map((studentIdStr) => ({
      student: Number(studentIdStr),
      subject: selectedSubject,
      total_mark: marks[studentIdStr],
      max_possible_mark: maxMark,
      term: selectedTerm,
      academic_year: currentYear,
    }));

    try {
      // The interceptor will automatically refresh the token if it expired
      // while the teacher was typing the marks.
      await api.post("academics/post-results/", payload);
      alert("Success: Marks saved!");
      setMarks({});
    } catch (error: any) {
      console.error("Upload Error:", error.response?.data);
      alert("Failed to save marks. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const teacherDisplay = () => {
    const storedUser = localStorage.getItem("user");
    const userData = storedUser ? JSON.parse(storedUser) : null;

    return {
      id: userData?.user_id || "---",
      name: userData ? `${userData.last_name}` : "---",
    };
  };

  return (
    <div className="w-full h-screen p-6 bg-white overflow-y-auto">
      <div className="flex gap-4 mb-8 items-center bg-white p-5 rounded-xl shadow-lg border border-gray-100">
        <span
          className="icon-teacher text-blue-600 w-15 h-15 rounded-lg"
          aria-hidden="true"
        ></span>
        <span className="flex flex-col">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Teacher Markbook
          </h2>
          <p className="text-sm font-medium text-slate-600">
            {teacherDisplay().name} - {teacherDisplay().id}
          </p>
        </span>
      </div>

      {/* Selections*/}
      <div className="flex flex-wrap gap-6 mb-8 bg-slate-800 p-6 rounded-xl shadow-lg items-end">
        {/* Subject Dropdown */}
        <div className="option">
          <label className="label">Select Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="select"
          >
            {assignments.subjects.length > 0 ? (
              assignments.subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))
            ) : (
              <option value="" className="bg-slate-800">
                No subjects assigned
              </option>
            )}
          </select>
        </div>

        {/* Class Dropdown */}
        <div className="option">
          <label className="label">Select Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="select"
          >
            {assignments.classes.length > 0 ? (
              assignments.classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))
            ) : (
              <option value="" className="bg-slate-800">
                No classes assigned
              </option>
            )}
          </select>
        </div>

        {/*Max possible mark*/}
        <div className="option">
          <label className="label">Max Mark (Out of)</label>
          <input
            type="number"
            value={maxMark}
            onChange={(e) => setMaxMark(Number(e.target.value))}
            className="select"
          />
        </div>

        {/* Term Selection */}
        <div className="option">
          <label className="label">Select Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="select"
          >
            <option value="1">Term 1</option>
            <option value="2">Term 2</option>
            <option value="3">Term 3</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white shadow-sm">
            <tr className="bg-slate-800 text-slate-100">
              <th className="p-4 text-left font-medium first:rounded-l-lg">
                Student ID
              </th>
              <th className="p-4 text-left font-medium">Full Name</th>
              <th className="p-4 text-center font-medium w-32 last:rounded-r-lg">
                Mark
              </th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 border-b">
                  <td className="p-3 font-mono text-medium font-extrabold">
                    {student.user_id.toUpperCase()}
                  </td>
                  <td className="p-3 text-medium font-extrabold">
                    {student.name}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="border p-2 w-24 text-center rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      onChange={(e) =>
                        handleInputChange(String(student.id), e.target.value)
                      }
                      value={marks[String(student.id)] || ""}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-400">
                  No students found for this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Submit Footer */}
      <div className="mt-8 flex items-center justify-between border-t pt-6">
        <p className="text-sm text-gray-500 font-medium">
          {Object.keys(marks).length} students graded for{" "}
          <span className="text-blue-600">{selectedSubject}</span>
        </p>
        <button
          onClick={submitMarks}
          disabled={Object.keys(marks).length === 0 || loading}
          className={`px-8 py-3 rounded text-white font-bold shadow-md transition ${
            Object.keys(marks).length === 0 || loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 active:transform active:scale-95"
          }`}
        >
          {loading ? "Saving Results..." : "Submit All Marks"}
        </button>
      </div>
    </div>
  );
};

export default MarkEntry;
