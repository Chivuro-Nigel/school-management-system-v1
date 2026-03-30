import Layout from "../components/sidebar";
import "../css/results.css";
import Footer from "../components/footer";
import schoollogo from "../images/school-logo-example.jpg";
import { useEffect, useState } from "react";
import api from "../components/api";
//for the download pdf button
import { toPng } from "html-to-image"; // Modern library
import jsPDF from "jspdf";
import { useRef } from "react";

const StudentResults = () => {
  const [user, setUser] = useState<any>(null);
  const [results, setResults] = useState([]);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString(),
  );
  const [selectedTerm, setSelectedTerm] = useState("1");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) =>
    (currentYear - i).toString(),
  );

  const [stats, setStats] = useState({
    classRank: 0,
    classTotal: 0,
  });

  //variable to store school details
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Loading.....",
    logo: "",
  });

  //reference to the card
  const reportTemplateRef = useRef<HTMLDivElement>(null);

  const calculateGPA = (resultsList: any[]) => {
    if (!resultsList || resultsList.length === 0) return "0.0";
    const gradeValues: { [key: string]: number } = {
      "A*": 4.0,
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      E: 1.0,
      U: 0.0,
    };
    const totalPoints = resultsList.reduce(
      (sum, item) => sum + (gradeValues[item.grade] || 0),
      0,
    );
    return (totalPoints / resultsList.length).toFixed(1);
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedTerm]);

  const handleDownloadPDF = async () => {
    const element = reportTemplateRef.current;
    if (!element) return;

    try {
      // 1. Convert HTML to a high-quality PNG data URL
      const dataUrl = await toPng(element, {
        quality: 0.95,
        pixelRatio: 2, // Keeps it sharp
        cacheBust: true,
        filter: (node) => {
          const tagName = node.tagName ? node.tagName.toLowerCase() : "";
          return tagName !== "button";
        },
      });

      // 2. Setup PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      // 3. Calculate dimensions to fit A4
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // 4. Add image and save
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Transcript_${user?.user_id?.toUpperCase() || "Student"}.pdf`);
    } catch (err) {
      console.error("Modern PDF Export Error:", err);
      alert("There was an error generating the PDF. Check the console.");
    }
  };
  const studentDisplay = {
    ID: user?.user_id || "---",
    name: user ? `${user.first_name} ${user.last_name}` : "Loading...",
  };

  const fetchData = async () => {
    try {
      // Look how much cleaner this is without the manual config/headers!
      const [profileRes, resultsRes, schRes] = await Promise.all([
        api.get("accounts/profile/"),
        api.get("academics/my-results/", {
          params: { academic_year: selectedYear, term: selectedTerm },
        }),
        api.get("core/school-info/"),
      ]);

      setUser(profileRes.data);

      // IMPORTANT: Keep your logic for .results and stats
      setResults(resultsRes.data.results);

      setStats({
        classRank: resultsRes.data.class_standing,
        classTotal: resultsRes.data.class_total,
      });

      setSchoolInfo({
        name: schRes.data.school_name,
        logo: schRes.data.school_logo,
      });
    } catch (err: any) {
      console.error("Fetch Data Error:", err);
      // If the refresh token also fails, the interceptor in api.ts
      // will handle the logout/redirect for you.
    }
  };

  const getGradeColor = (grade: string) => {
    const g = grade.toUpperCase().trim();

    switch (g) {
      case "A*":
      case "A":
        return "text-green-600 font-black"; // Distinction
      case "B":
        return "text-blue-600 font-bold"; // Merit
      case "C":
        return "text-cyan-600 font-bold"; // Credit/Pass
      case "D":
      case "E":
        return "text-orange-500 font-semibold"; // Weak Pass
      case "U":
        return "text-red-600 font-black"; // Ungraded/Fail
      default:
        return "text-gray-700";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#F8FAFC] pb-20">
        <div
          ref={reportTemplateRef}
          style={{ backgroundColor: "#F8FAFC" }}
          className="max-w-6xl mx-auto px-6 py-10"
        >
          {/* 1. TOP BAR: Institutional Identity */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 bg-white p-6 rounded-4xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 overflow-hidden rounded-2xl bg-slate-900 shadow-lg">
                <img
                  src={schoolInfo.logo || schoollogo}
                  alt="Logo"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {schoolInfo.name || " "}
                </h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                  Academic Transcript
                </p>
              </div>
            </div>

            {/* Dynamic Filters */}
            <div className="flex gap-4 mt-6 md:mt-0 bg-slate-50 p-2 rounded-2xl border border-slate-100">
              <div className="flex flex-col px-4 border-r border-slate-200">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Academic Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col px-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  Term Period
                </label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="bg-transparent text-sm font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="1">First Term</option>
                  <option value="2">Second Term</option>
                  <option value="3">Third Term</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. STUDENT INFO STRIP */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Student Name
              </p>
              <p className="text-lg font-black text-slate-800 truncate">
                {studentDisplay.name}
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Registration ID
              </p>
              <p className="text-lg font-black text-slate-800 tabular-nums">
                #{studentDisplay.ID}
              </p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Class Level
              </p>
              <p className="text-lg font-black text-blue-600 uppercase">
                {user?.class_level || "---"}
              </p>
            </div>
            <div className="bg-blue-600 p-5 rounded-3xl shadow-lg shadow-blue-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-1">
                  {calculateGPA(results)}
                </p>
                <p className="text-2xl font-black text-white">3.8</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3. RESULTS TABLE CARD */}
          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Performance Summary
              </h2>
              <button
                onClick={handleDownloadPDF}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer"
              >
                DOWNLOAD PDF
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Subject
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Percentage Score
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Grade
                    </th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                      Class Avg
                    </th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.map((res: any) => (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-10 py-6">
                        <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                          {res.subject_name}
                        </p>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-base font-bold text-slate-700 tabular-nums">
                          {res.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span
                          className={`px-4 py-1.5 rounded-xl text-xs font-black ring-1 ring-inset ${getGradeColor(res.grade)}`}
                        >
                          {res.grade}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center font-medium text-slate-400 tabular-nums">
                        {res.class_average || "62"}%
                      </td>
                      <td className="px-10 py-6">
                        <p className="text-sm text-slate-500 italic leading-relaxed">
                          {res.remark || "Satisfactory progress."}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. RANKING FOOTER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-4xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">
                  Class Standing
                </p>
                <p className="text-4xl font-black text-emerald-900">
                  {stats.classRank.toString().padStart(2, "0")}
                  <span className="text-lg text-emerald-500/60 font-medium">
                    {" "}
                    / {stats.classTotal}
                  </span>
                </p>
              </div>
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <svg
                  width="32"
                  height="32"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default StudentResults;
