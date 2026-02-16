"use client"; // MUST be first line

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import jsPDF from "jspdf";
import "jspdf-autotable"; // patches jsPDF
import * as XLSX from "xlsx";

export default function AttendancePage() {
  const router = useRouter();
  const [hostInfo, setHostInfo] = useState(null);
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState({ course: "", yearSection: "" });

  useEffect(() => {
    const host = sessionStorage.getItem("hostInfo");
    if (!host) {
      router.push("/host/login");
      return;
    }
    const hostObj = JSON.parse(host);
    setHostInfo(hostObj);
    fetchAttendance(hostObj.id);
  }, []);

  const fetchAttendance = async (hostId) => {
    const { data, error } = await supabase
      .from("attendance")
      .select(`id, scanned_at, student_id (lastname, firstname, course, yearsection)`)
      .eq("host_id", hostId);

    if (error) {
      console.error(error);
      return;
    }

    // Sort by course, yearSection, lastname
    const sorted = data.sort((a, b) => {
      if (a.student_id.course !== b.student_id.course)
        return a.student_id.course.localeCompare(b.student_id.course);
      if (a.student_id.yearsection !== b.student_id.yearsection)
        return a.student_id.yearsection.localeCompare(b.student_id.yearsection);
      return a.student_id.lastname.localeCompare(b.student_id.lastname);
    });

    setRecords(sorted);
  };

  // Apply filters
  const filteredRecords = records.filter(r => {
    return (
      (!filter.course || r.student_id.course === filter.course) &&
      (!filter.yearSection || r.student_id.yearsection === filter.yearSection)
    );
  });

  // PDF download
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Records", 14, 20);
    doc.autoTable({
      head: [["Last Name", "First Name", "Course", "YearSection", "Scanned At"]],
      body: filteredRecords.map(r => [
        r.student_id.lastname,
        r.student_id.firstname,
        r.student_id.course,
        r.student_id.yearsection,
        new Date(r.scanned_at).toLocaleString()
      ]),
      startY: 30
    });
    doc.save("attendance.pdf");
  };

  // Excel download
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredRecords.map(r => ({
        Lastname: r.student_id.lastname,
        Firstname: r.student_id.firstname,
        Course: r.student_id.course,
        YearSection: r.student_id.yearsection,
        ScannedAt: new Date(r.scanned_at).toLocaleString()
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance.xlsx");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={headerFooterStyle}>
        <h1>Attendance Records</h1>
      </header>

      <main style={mainStyle}>
        {/* Filters */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <select value={filter.course} onChange={e => setFilter({ ...filter, course: e.target.value })} style={inputStyle}>
            <option value="">All Courses</option>
            <option value="BSIT">BSIT</option>
            <option value="BSCS">BSCS</option>
            <option value="BSBA">BSBA</option>
          </select>

          <select value={filter.yearSection} onChange={e => setFilter({ ...filter, yearSection: e.target.value })} style={inputStyle}>
            <option value="">All YearSections</option>
            <option value="1A">1A</option>
            <option value="2A">2A</option>
            <option value="3A">3A</option>
            <option value="4A">4A</option>
          </select>
        </div>

        {/* Download Buttons */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
          <button style={buttonStyle} onClick={downloadPDF}>Download PDF</button>
          <button style={buttonStyle} onClick={downloadExcel}>Download Excel</button>
          <button style={buttonStyle} onClick={() => router.push("/host/dashboard")}>Back</button>
        </div>

        {/* Attendance List */}
        {filteredRecords.length === 0 ? (
          <p>No attendance records.</p>
        ) : (
          <div style={{ width: "100%", maxWidth: "700px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredRecords.map(r => (
              <div key={r.id} style={recordStyle}>
                <div>
                  <strong>{r.student_id.lastname}, {r.student_id.firstname}</strong>
                  <p>{r.student_id.course} - {r.student_id.yearsection}</p>
                </div>
                <div>{new Date(r.scanned_at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer style={headerFooterStyle}>
        <p>© 2026</p>
      </footer>
    </div>
  );
}

// ------------------------
// Styles
// ------------------------
const headerFooterStyle = { backgroundColor: "#FFD700", padding: "20px", textAlign: "center" };
const mainStyle = { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" };
const inputStyle = { padding: "10px", borderRadius: "8px", border: "1px solid #ccc" };
const buttonStyle = { padding: "12px 30px", fontSize: "16px", borderRadius: "8px", border: "none", backgroundColor: "#f4b400", color: "white", cursor: "pointer", minWidth: "120px" };
const recordStyle = { display: "flex", justifyContent: "space-between", padding: "12px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" };
