"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AttendancePage() {
  const router = useRouter();
  const [hostInfo, setHostInfo] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const host = sessionStorage.getItem("hostInfo");
    if (!host) router.push("/host");
    else {
      const hostObj = JSON.parse(host);
      setHostInfo(hostObj);
      fetchAttendance(hostObj.id);
    }
  }, []);

  const fetchAttendance = async (hostId) => {
    setLoading(true);
    try {
      const { data: attendance, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("host_id", hostId)
        .order("scanned_at", { ascending: true });

      if (attendanceError) throw attendanceError;
      if (!attendance || attendance.length === 0) {
        setRecords([]);
        setGroups([]);
        setSelectedGroup("");
        setLoading(false);
        return;
      }

      const studentIds = attendance.map(a => a.student_id);
      const { data: students, error: studentError } = await supabase
        .from("students")
        .select("*")
        .in("id", studentIds);

      if (studentError) throw studentError;

      const mergedRecords = attendance.map(a => {
        const student = students.find(s => s.id === a.student_id) || {};
        return { ...a, student };
      });

      // Sort by course → yearsection → lastname
      mergedRecords.sort((a, b) => {
        if (a.student.course !== b.student.course)
          return a.student.course.localeCompare(b.student.course);
        if (a.student.yearsection !== b.student.yearsection)
          return a.student.yearsection.localeCompare(b.student.yearsection);
        return a.student.lastname.localeCompare(b.student.lastname);
      });

      setRecords(mergedRecords);

      // Groups for filter dropdown
      const uniqueGroups = [
        ...new Set(mergedRecords.map(r => `${r.student.course} - ${r.student.yearsection}`))
      ];
      setGroups(uniqueGroups);
      setSelectedGroup(uniqueGroups[0] || "");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = selectedGroup
    ? records.filter(r => `${r.student.course} - ${r.student.yearsection}` === selectedGroup)
    : records;

  // ----------------
  // Download helpers
  // ----------------
  const prepareData = (data) =>
    data.map(r => ({
      Course: r.student.course,
      "Year/Section": r.student.yearsection,
      "Last Name": r.student.lastname,
      "First Name": r.student.firstname,
      "Scanned At": new Date(r.scanned_at).toLocaleString()
    }));

  const downloadExcel = (all = false) => {
    const data = all ? records : filteredRecords;
    if (!data.length) return;

    const ws = XLSX.utils.json_to_sheet(prepareData(data));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, all ? "attendance_all.xlsx" : "attendance.xlsx");
  };

  const downloadPDF = (all = false) => {
    const data = all ? records : filteredRecords;
    if (!data.length) return;

    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Course", "Year/Section", "Last Name", "First Name", "Scanned At"]],
      body: prepareData(data).map(r => [r.Course, r["Year/Section"], r["Last Name"], r["First Name"], r["Scanned At"]]),
      startY: 10
    });
    doc.save(all ? "attendance_all.pdf" : "attendance.pdf");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={headerFooterStyle}>
        <h1>Attendance Records</h1>
      </header>

      <main style={mainStyle}>
        {/* Controls */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
          <button style={buttonStyle} onClick={() => fetchAttendance(hostInfo.id)} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh List"}
          </button>

          <select
            style={buttonStyle}
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {groups.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <button style={buttonStyle} onClick={() => downloadExcel(false)}>Download Excel</button>
          <button style={buttonStyle} onClick={() => downloadPDF(false)}>Download PDF</button>

          <button style={buttonStyle} onClick={() => downloadExcel(true)}>Download All Excel</button>
          <button style={buttonStyle} onClick={() => downloadPDF(true)}>Download All PDF</button>
        </div>

        {/* Attendance Records */}
        {filteredRecords.length === 0 ? (
          <p>No attendance recorded for this group.</p>
        ) : (
          filteredRecords.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                marginTop: "8px",
                width: "100%",
                maxWidth: "700px"
              }}
            >
              <div>
                <p><strong>{r.student.lastname}, {r.student.firstname}</strong></p>
                <p>{r.student.course} - {r.student.yearsection}</p>
              </div>
              <div>
                <p>{new Date(r.scanned_at).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}

        <button style={{ ...buttonStyle, marginTop: "20px" }} onClick={() => router.push("/host/dashboard")}>
          Back to Dashboard
        </button>
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
const headerFooterStyle = {
  backgroundColor: "#FFD700",
  padding: "20px",
  textAlign: "center",
};

const mainStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "15px",
  padding: "20px",
};

const buttonStyle = {
  padding: "10px 20px",
  fontSize: "14px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#f4b400",
  color: "white",
  cursor: "pointer",
};
