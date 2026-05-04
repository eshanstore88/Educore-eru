import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  GraduationCap,
  CreditCard,
  LayoutDashboard,
  Download,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  CheckCircle,
  Save,
  Menu,
  MessageSquare,
  AlertCircle,
  FileText,
  DollarSign,
  HeartPulse,
  Info,
  Printer,
} from "lucide-react";

// Initial Dummy Data with new fields
const initialStudents = [
  {
    id: "STU-001",
    name: "Aarav Sharma",
    fatherName: "Rajesh Sharma",
    fatherNumber: "03001234567",
    motherName: "Sunita Sharma",
    motherNumber: "",
    medicalNotes: "Dust Allergy",
    className: "10th",
    section: "A",
    dob: "2008-05-14",
    address: "123, Main Bazar, Karachi",
    baseFee: 5000,
    feeCycle: "Monthly",
    totalBilled: 15000,
    paidAmount: 10000,
    feeStatus: "Pending",
    status: "Active",
  },
  {
    id: "STU-002",
    name: "Zoya Khan",
    fatherName: "Tariq Khan",
    fatherNumber: "03339876543",
    motherName: "",
    motherNumber: "",
    medicalNotes: "",
    className: "12th",
    section: "B",
    dob: "2006-08-22",
    address: "45, Civil Lines, Lahore",
    baseFee: 12000,
    feeCycle: "3 Months",
    totalBilled: 12000,
    paidAmount: 12000,
    feeStatus: "Paid",
    status: "Active",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- OFFLINE LOCAL STORAGE LOGIC ADDED HERE ---
  // Data ko Local Storage se load karna
  const [students, setStudents] = useState(() => {
    const savedData = localStorage.getItem("educore_students");
    if (savedData) {
      return JSON.parse(savedData);
    }
    return initialStudents;
  });

  // Jab bhi data change ho, usko background mein auto-save karna
  useEffect(() => {
    localStorage.setItem("educore_students", JSON.stringify(students));
  }, [students]);
  // ----------------------------------------------

  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form states
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    fatherName: "",
    fatherNumber: "",
    motherName: "",
    motherNumber: "",
    medicalNotes: "",
    className: "",
    section: "",
    dob: "",
    address: "",
    baseFee: 0,
    feeCycle: "Monthly",
    totalBilled: 0,
    paidAmount: 0,
    status: "Active",
  });

  const [feeUpdateData, setFeeUpdateData] = useState({
    id: "",
    additionalPayment: 0,
    studentName: "",
    currentPaid: 0,
  });
  const [lastReceipt, setLastReceipt] = useState(null);

  // --- Derived State (Stats) ---
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === "Active").length;
    const totalRevenue = students.reduce(
      (sum, s) => sum + Number(s.totalBilled || 0),
      0
    );
    const collectedFee = students.reduce(
      (sum, s) => sum + Number(s.paidAmount || 0),
      0
    );
    const pendingFee = totalRevenue - collectedFee;
    return {
      totalStudents,
      activeStudents,
      totalRevenue,
      collectedFee,
      pendingFee,
    };
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.fatherName &&
          s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [students, searchQuery]);

  // --- Handlers ---
  const handleOpenStudentModal = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData(student);
    } else {
      setEditingStudent(null);
      setFormData({
        id: `STU-00${students.length + 1}`,
        name: "",
        fatherName: "",
        fatherNumber: "",
        motherName: "",
        motherNumber: "",
        medicalNotes: "",
        className: "",
        section: "",
        dob: "",
        address: "",
        baseFee: 0,
        feeCycle: "Monthly",
        totalBilled: 0,
        paidAmount: 0,
        status: "Active",
      });
    }
    setIsStudentModalOpen(true);
  };

  const handleCloseStudentModal = () => {
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleStudentFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    // Defaulting to 0 if fields are left empty
    const billed = Number(formData.totalBilled) || 0;
    const paid = Number(formData.paidAmount) || 0;
    const status =
      paid >= billed && billed > 0
        ? "Paid"
        : billed === 0
        ? "No Dues"
        : "Pending";

    const newStudentData = {
      ...formData,
      totalBilled: billed,
      paidAmount: paid,
      feeStatus: status,
    };

    if (editingStudent) {
      setStudents(
        students.map((s) => (s.id === editingStudent.id ? newStudentData : s))
      );
    } else {
      setStudents([...students, newStudentData]);
    }
    handleCloseStudentModal();
  };

  const confirmDeleteStudent = () => {
    if (deleteTarget) {
      setStudents(students.filter((s) => s.id !== deleteTarget));
      setDeleteTarget(null);
    }
  };

  // --- Fee Management Handlers ---
  const handleOpenFeeModal = (student) => {
    const due = (student.totalBilled || 0) - (student.paidAmount || 0);
    setFeeUpdateData({
      id: student.id,
      additionalPayment: due > 0 ? due : 0,
      studentName: student.name,
      due: due,
      currentPaid: student.paidAmount || 0,
    });
    setIsFeeModalOpen(true);
  };

  const handleSaveFee = (e) => {
    e.preventDefault();
    const payment = Number(feeUpdateData.additionalPayment) || 0;

    let updatedStudent = null;

    setStudents(
      students.map((s) => {
        if (s.id === feeUpdateData.id) {
          const newPaid = Number(s.paidAmount || 0) + payment;
          const status = newPaid >= (s.totalBilled || 0) ? "Paid" : "Pending";
          updatedStudent = { ...s, paidAmount: newPaid, feeStatus: status };
          return updatedStudent;
        }
        return s;
      })
    );

    setIsFeeModalOpen(false);

    // Open Receipt Modal
    if (updatedStudent) {
      setLastReceipt({
        ...updatedStudent,
        amountPaidNow: payment,
        date: new Date().toLocaleDateString(),
      });
      setTimeout(() => setIsReceiptModalOpen(true), 300);
    }
  };

  const handleGenerateCycleBills = () => {
    const updatedStudents = students.map((s) => {
      if (s.status !== "Active") return s; // Skip inactive students
      const newBilled = Number(s.totalBilled || 0) + Number(s.baseFee || 0);
      const status =
        Number(s.paidAmount || 0) >= newBilled && newBilled > 0
          ? "Paid"
          : "Pending";
      return { ...s, totalBilled: newBilled, feeStatus: status };
    });
    setStudents(updatedStudents);
    alert(
      "System Generated: New cycle dues have been added to all active student accounts."
    );
  };

  const sendSMSReminder = (student) => {
    if (!student.fatherNumber) {
      alert("No contact number provided for this student.");
      return;
    }
    const due = (student.totalBilled || 0) - (student.paidAmount || 0);
    const message = `Dear ${
      student.fatherName || "Guardian"
    },\n\nThis is a gentle reminder from the School Administration. An amount of PKR ${due.toLocaleString()} is currently pending for your child ${
      student.name
    }. Kindly clear the dues at your earliest convenience.\n\nThank you,\nSchool Management`;

    const encodedMessage = encodeURIComponent(message);
    const smsLink = `sms:${student.fatherNumber}?body=${encodedMessage}`;
    window.open(smsLink, "_blank");
  };

  const printReceipt = () => {
    window.print();
  };

  // --- Export to Excel (CSV) ---
  const exportToExcel = () => {
    const headers = [
      "Student ID,Name,Father Name,Father Number,Mother Name,Medical Notes,Class,Section,DOB,Address,Status,Fee Cycle,Base Fee,Total Billed,Paid Amount,Due Amount,Fee Status\n",
    ];
    const rows = students.map((s) => {
      const due = (s.totalBilled || 0) - (s.paidAmount || 0);
      const address = `"${s.address || ""}"`;
      const medical = `"${s.medicalNotes || ""}"`;
      return `${s.id},${s.name},${s.fatherName || ""},${s.fatherNumber || ""},${
        s.motherName || ""
      },${medical},${s.className || ""},${s.section || ""},${
        s.dob || ""
      },${address},${s.status},${s.feeCycle || ""},${s.baseFee || 0},${
        s.totalBilled || 0
      },${s.paidAmount || 0},${due},${s.feeStatus}\n`;
    });

    const csvContent = headers.concat(rows).join("");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "School_Records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group ${
        activeTab === id
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
          : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <Icon
        size={20}
        className={`transition-transform duration-300 ${
          activeTab === id
            ? "text-white scale-110"
            : "text-slate-400 group-hover:scale-110 group-hover:text-white"
        }`}
      />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100">
      {/* Hide everything except receipt when printing */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-modal, #receipt-modal * { visibility: visible; }
          #receipt-modal { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none; border: none; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 w-72 bg-[#0f172a] text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <GraduationCap size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">
                EduCore
              </h1>
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">
                Premium ERP
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2 px-4">
            Menu
          </div>
          <NavItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="students" icon={Users} label="Student Directory" />
          <NavItem id="fees" icon={CreditCard} label="Fee Management" />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
              I
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Eshan</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 relative">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 sticky top-0 transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 capitalize hidden sm:block tracking-tight">
              {activeTab.replace("-", " ")}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                size={16}
              />
              <input
                type="text"
                placeholder="Quick search..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 transition-all shadow-sm group-focus-within:shadow-md group-focus-within:bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          {/* TAB: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Stat Cards with Hover Effects */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-default">
                  <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                    <Users size={100} />
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <Users size={24} />
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Total Active Students
                  </p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    {stats.activeStudents}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-default">
                  <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                    <DollarSign size={100} />
                  </div>
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <FileText size={24} />
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Total Expected Revenue
                  </p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    PKR {stats.totalRevenue.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-default">
                  <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                    <CheckCircle size={100} />
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <CheckCircle size={24} />
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Total Collected
                  </p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    PKR {stats.collectedFee.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group cursor-default">
                  <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
                    <AlertCircle size={100} />
                  </div>
                  <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
                    <AlertCircle size={24} />
                  </div>
                  <p className="text-sm text-slate-500 font-medium mb-1">
                    Total Pending Dues
                  </p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">
                    PKR {stats.pendingFee.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Quick List */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">
                    Recent Enrollments
                  </h3>
                  <button
                    onClick={() => setActiveTab("students")}
                    className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                  >
                    View All Directory
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-sm">
                        <th className="pb-3 font-semibold">Student ID</th>
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Class</th>
                        <th className="pb-3 font-semibold">Fee Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students
                        .slice(-5)
                        .reverse()
                        .map((student) => (
                          <tr
                            key={student.id}
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-4 text-sm font-medium text-slate-600">
                              {student.id}
                            </td>
                            <td className="py-4 font-semibold text-slate-800">
                              {student.name}
                              {student.medicalNotes && (
                                <HeartPulse
                                  size={12}
                                  className="inline ml-2 text-rose-500"
                                  title="Has medical notes"
                                />
                              )}
                            </td>
                            <td className="py-4 text-sm text-slate-600">
                              {student.className || "-"}{" "}
                              {student.section ? `(${student.section})` : ""}
                            </td>
                            <td className="py-4">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold ${
                                  student.feeStatus === "Paid"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : student.feeStatus === "No Dues"
                                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}
                              >
                                {student.feeStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      {students.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-8 text-center text-slate-500"
                          >
                            No recent enrollments.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STUDENTS */}
          {activeTab === "students" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 rounded-t-2xl">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Student Directory
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage complete student profiles and medical records.
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={exportToExcel}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium text-sm hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Download size={18} /> Export CSV
                  </button>
                  <button
                    onClick={() => handleOpenStudentModal()}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium text-sm hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Plus size={18} /> New Student
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                      <th className="p-4 font-semibold w-24">ID</th>
                      <th className="p-4 font-semibold">Student Info</th>
                      <th className="p-4 font-semibold">Primary Contact</th>
                      <th className="p-4 font-semibold">Class / Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-12 text-center text-slate-500"
                        >
                          No students match your search.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr
                          key={student.id}
                          className={`transition-colors group hover:bg-blue-50/30 ${
                            student.status === "Left"
                              ? "opacity-60 bg-slate-50"
                              : ""
                          }`}
                        >
                          <td className="p-4">
                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                              {student.id}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-800 text-base flex items-center gap-2">
                              {student.name}
                              {student.medicalNotes && (
                                <HeartPulse
                                  size={14}
                                  className="text-rose-500"
                                  title={`Medical Note: ${student.medicalNotes}`}
                                />
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              DOB: {student.dob || "-"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-700">
                              {student.fatherName ||
                                student.motherName ||
                                "No Guardian Name"}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                              {student.fatherNumber ||
                                student.motherNumber ||
                                "No Contact Number"}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-slate-800">
                              {student.className || "Not Assigned"}{" "}
                              <span className="text-sm text-slate-500 ml-1">
                                {student.section ? `(${student.section})` : ""}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 inline-block ${
                                student.status === "Active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {student.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                              <button
                                onClick={() => handleOpenStudentModal(student)}
                                className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:scale-105 rounded-lg transition-all"
                                title="Edit Profile"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(student.id)}
                                className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:scale-105 rounded-lg transition-all"
                                title="Delete Student"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: FEES */}
          {activeTab === "fees" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[80vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 rounded-t-2xl">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Fee Collection & Dues
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage payments, print receipts, and send reminders.
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={handleGenerateCycleBills}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-sm font-medium text-sm hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <FileText size={18} /> Generate Cycle Bills
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-sm border-b border-slate-200">
                      <th className="p-4 font-semibold">Student Info</th>
                      <th className="p-4 font-semibold">Fee Structure</th>
                      <th className="p-4 font-semibold">Billed Amount</th>
                      <th className="p-4 font-semibold">Paid Amount</th>
                      <th className="p-4 font-semibold">Current Dues</th>
                      <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => {
                      if (student.status === "Left") return null; // Hide left students from fees
                      const due =
                        (student.totalBilled || 0) - (student.paidAmount || 0);
                      const hasDues = due > 0;
                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50 transition-colors group"
                        >
                          <td className="p-4">
                            <div className="font-bold text-slate-800">
                              {student.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {student.id} • {student.className || "-"}{" "}
                              {student.section ? `(${student.section})` : ""}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-slate-700">
                              {student.baseFee
                                ? `PKR ${student.baseFee.toLocaleString()}`
                                : "-"}
                            </div>
                            <div className="text-xs text-slate-500 bg-slate-200 inline-block px-1.5 py-0.5 rounded mt-1">
                              {student.feeCycle || "N/A"}
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-700">
                            PKR {(student.totalBilled || 0).toLocaleString()}
                          </td>
                          <td className="p-4 font-semibold text-emerald-600">
                            PKR {(student.paidAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`font-bold ${
                                hasDues ? "text-rose-600" : "text-slate-400"
                              }`}
                            >
                              PKR {due.toLocaleString()}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                disabled={!hasDues}
                                onClick={() => handleOpenFeeModal(student)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                                  hasDues
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-600 hover:text-white hover:-translate-y-0.5 hover:shadow-md"
                                    : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                                }`}
                              >
                                <CreditCard size={16} /> Pay
                              </button>

                              <button
                                disabled={!hasDues}
                                onClick={() => sendSMSReminder(student)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all border ${
                                  hasDues
                                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-600 hover:text-white hover:-translate-y-0.5 hover:shadow-md"
                                    : "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed hidden md:flex"
                                }`}
                                title="Send SMS Reminder"
                              >
                                <MessageSquare size={16} /> SMS
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS & POPUPS --- */}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center transform scale-100 animate-in zoom-in-90 duration-300">
            <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5 border-[6px] border-white shadow-sm">
              <AlertCircle size={36} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Delete Student?
            </h3>
            <p className="text-slate-500 mb-6 text-sm">
              Are you sure you want to remove this student? This action cannot
              be undone and will erase all their records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteStudent}
                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/30 hover:-translate-y-0.5"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal (Fully Optional fields) */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col transform scale-100 animate-in zoom-in-95 duration-300">
            <div className="p-5 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  {editingStudent
                    ? "Edit Student Profile"
                    : "Enroll New Student"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Fields marked with * are mandatory.
                </p>
              </div>
              <button
                onClick={handleCloseStudentModal}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <form
                id="studentForm"
                onSubmit={handleSaveStudent}
                className="p-6 md:p-8 space-y-10"
              >
                {/* 1. Personal Details */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Users size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Personal Information
                    </h3>
                    <div className="flex-1 h-[1px] bg-slate-100 ml-2"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Student ID (Auto)
                      </label>
                      <input
                        type="text"
                        name="id"
                        value={formData.id}
                        readOnly
                        className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed font-mono text-sm shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Student Full Name{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleStudentFormChange}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        placeholder="e.g. Ali Raza"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleStudentFormChange}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Residential Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleStudentFormChange}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        placeholder="Optional full address"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Student Status
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="Active"
                            checked={formData.status === "Active"}
                            onChange={handleStudentFormChange}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            Active
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="status"
                            value="Left"
                            checked={formData.status === "Left"}
                            onChange={handleStudentFormChange}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            Left/Inactive
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. Guardian Details */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Info size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Guardian & Extra Info
                    </h3>
                    <div className="flex-1 h-[1px] bg-slate-100 ml-2"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Father's Name
                      </label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleStudentFormChange}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Father's Contact Number
                      </label>
                      <input
                        type="tel"
                        name="fatherNumber"
                        value={formData.fatherNumber}
                        onChange={handleStudentFormChange}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        placeholder="e.g. 03XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Mother's Name
                      </label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleStudentFormChange}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        placeholder="Optional"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Emergency / Mother's Number
                      </label>
                      <input
                        type="tel"
                        name="motherNumber"
                        value={formData.motherNumber}
                        onChange={handleStudentFormChange}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        placeholder="Optional"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                        Medical Notes / Allergies{" "}
                        <HeartPulse size={14} className="text-rose-500" />
                      </label>
                      <textarea
                        name="medicalNotes"
                        value={formData.medicalNotes}
                        onChange={handleStudentFormChange}
                        rows="2"
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all shadow-sm"
                        placeholder="e.g. Asthma, Peanut allergy, or leave blank if none."
                      ></textarea>
                    </div>
                  </div>
                </section>

                {/* 3. Academic & Financial */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CreditCard size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      Academic & Fee Structure
                    </h3>
                    <div className="flex-1 h-[1px] bg-slate-100 ml-2"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Class
                        </label>
                        <select
                          name="className"
                          value={formData.className}
                          onChange={handleStudentFormChange}
                          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all shadow-sm"
                        >
                          <option value="">Select...</option>
                          {[
                            "Nursery",
                            "Prep",
                            "1st",
                            "2nd",
                            "3rd",
                            "4th",
                            "5th",
                            "6th",
                            "7th",
                            "8th",
                            "9th",
                            "10th",
                            "11th",
                            "12th",
                          ].map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-1/3">
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          Sec
                        </label>
                        <select
                          name="section"
                          value={formData.section}
                          onChange={handleStudentFormChange}
                          className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all shadow-sm"
                        >
                          <option value="-">-</option>
                          {["A", "B", "C", "D"].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Fee Billing Cycle
                      </label>
                      <select
                        name="feeCycle"
                        value={formData.feeCycle}
                        onChange={handleStudentFormChange}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-all shadow-sm"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="3 Months">Quarterly (3 Months)</option>
                        <option value="6 Months">Half-Yearly (6 Months)</option>
                        <option value="12 Months">Yearly (12 Months)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Base Fee Per Cycle (PKR)
                      </label>
                      <input
                        type="number"
                        name="baseFee"
                        min="0"
                        value={formData.baseFee}
                        onChange={handleStudentFormChange}
                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                        placeholder="0"
                      />
                    </div>

                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-inner">
                      <label className="block text-sm font-semibold text-blue-900 mb-1.5">
                        Initial Billed Amount (PKR)
                      </label>
                      <input
                        type="number"
                        name="totalBilled"
                        min="0"
                        value={formData.totalBilled}
                        onChange={handleStudentFormChange}
                        className="w-full p-2.5 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none bg-white text-blue-900 font-bold shadow-sm"
                        placeholder="0"
                      />
                      <p className="text-[10px] text-blue-600 mt-1.5 font-medium">
                        Any starting amount they already owe upon admission.
                      </p>
                    </div>
                  </div>
                </section>
              </form>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleCloseStudentModal}
                className="px-6 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="studentForm"
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Save size={18} />{" "}
                {editingStudent ? "Save Changes" : "Enroll Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Fee Modal */}
      {isFeeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform scale-100 animate-in zoom-in-95 duration-300">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">
                Receive Payment
              </h2>
              <button
                onClick={() => setIsFeeModalOpen(false)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFee} className="p-6 space-y-6">
              <div className="bg-emerald-50 p-5 rounded-2xl text-emerald-900 border border-emerald-100 shadow-inner">
                <p className="font-bold text-lg">{feeUpdateData.studentName}</p>
                <p className="text-xs font-medium opacity-80 mt-0.5 tracking-wider">
                  ID: {feeUpdateData.id}
                </p>
                <div className="mt-4 pt-4 border-t border-emerald-200/60 flex justify-between items-center">
                  <span className="font-semibold text-sm">
                    Outstanding Dues:
                  </span>
                  <span className="font-black text-2xl tracking-tight">
                    PKR {feeUpdateData.due.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Amount Received (PKR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    Rs.
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    max={feeUpdateData.due}
                    value={feeUpdateData.additionalPayment}
                    onChange={(e) =>
                      setFeeUpdateData((prev) => ({
                        ...prev,
                        additionalPayment: e.target.value,
                      }))
                    }
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-xl font-black text-slate-800 transition-all shadow-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                  <AlertCircle size={14} className="text-amber-500" /> Value
                  must not exceed outstanding dues.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFeeModalOpen(false)}
                  className="px-5 py-3 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <CheckCircle size={18} /> Process & Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {isReceiptModalOpen && lastReceipt && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[70] animate-in fade-in duration-300">
          <div
            id="receipt-modal"
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform scale-100 animate-in zoom-in-95 duration-300"
          >
            {/* Receipt Content */}
            <div className="p-8 bg-white" style={{ fontFamily: "monospace" }}>
              <div className="text-center mb-6">
                <GraduationCap
                  size={40}
                  className="mx-auto text-slate-800 mb-2"
                />
                <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">
                  EduCore School
                </h2>
                <p className="text-xs text-slate-500">
                  Official Payment Receipt
                </p>
              </div>

              <div className="border-t-2 border-dashed border-slate-200 py-4 my-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>{" "}
                  <span className="font-bold">{lastReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt No:</span>{" "}
                  <span className="font-bold">
                    REC-{Math.floor(Math.random() * 90000) + 10000}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Student ID:</span>{" "}
                  <span className="font-bold">{lastReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>{" "}
                  <span className="font-bold">{lastReceipt.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class:</span>{" "}
                  <span className="font-bold">
                    {lastReceipt.className || "-"} {lastReceipt.section || ""}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-slate-200 py-4 my-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-600 font-bold uppercase text-xs tracking-wider">
                    Amount Paid
                  </span>
                  <span className="text-2xl font-black text-slate-800">
                    PKR {Number(lastReceipt.amountPaidNow).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-4">
                  <span className="text-slate-500">Previous Total Paid:</span>
                  <span className="font-bold text-slate-700">
                    PKR{" "}
                    {(
                      Number(lastReceipt.paidAmount) -
                      Number(lastReceipt.amountPaidNow)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-slate-500">Remaining Dues:</span>
                  <span className="font-bold text-rose-600">
                    PKR{" "}
                    {(
                      Number(lastReceipt.totalBilled) -
                      Number(lastReceipt.paidAmount)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-center mt-8 text-xs text-slate-400">
                <p>Thank you for your payment.</p>
                <p>System Generated Receipt</p>
              </div>
            </div>

            {/* Non-printable action buttons */}
            <div className="p-4 bg-slate-100 flex gap-3 no-print border-t border-slate-200">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={printReceipt}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Printer size={18} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
