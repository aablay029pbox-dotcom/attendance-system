"use client"; // MUST be first line

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/library";
import { supabase } from "../../lib/supabase";

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const [hostInfo, setHostInfo] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if host is logged in
    const host = sessionStorage.getItem("hostInfo");
    if (!host) {
      router.push("/host/login");
      return;
    }
    setHostInfo(JSON.parse(host));

    // Initialize scanner
    codeReaderRef.current = new BrowserMultiFormatReader();
    startScanner();

    // Cleanup
    return () => {
      if (codeReaderRef.current) codeReaderRef.current.reset();
    };
  }, []);

  const startScanner = async () => {
    if (!videoRef.current) return;

    try {
      await codeReaderRef.current.decodeFromVideoDevice(
        null, // default camera
        videoRef.current,
        async (result, err) => {
          if (result) {
            handleScan(result.getText());
          }
          if (err && err.name !== "NotFoundException") console.error(err);
        }
      );
    } catch (err) {
      console.error("Scanner init error:", err);
      setMessage("Failed to start scanner. Check camera permissions.");
    }
  };

  const handleScan = async (text) => {
    if (!text) return;

    const studentId = text.trim(); // Only student ID

    try {
      // Prevent duplicate entries
      const { data: existing, error: checkError } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", studentId)
        .eq("host_id", hostInfo.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existing) {
        setMessage(`Student ID ${studentId} already marked!`);
        return;
      }

      // Insert new attendance
      const { error } = await supabase.from("attendance").insert([
        { student_id: studentId, host_id: hostInfo.id }
      ]);

      if (error) throw error;

      setMessage(`Attendance marked for Student ID: ${studentId}`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to mark attendance");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={headerFooterStyle}>
        <h1>Scan QR Code</h1>
      </header>

      <main style={mainStyle}>
        <p>{message}</p>
        <video
          ref={videoRef}
          style={{ width: "100%", maxWidth: "400px", borderRadius: "8px" }}
        />

        <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
          <button style={buttonStyle} onClick={() => router.push("/host/dashboard")}>
            Back
          </button>
        </div>
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
  textAlign: "center"
};

const mainStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  padding: "20px"
};

const buttonStyle = {
  padding: "12px 30px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#f4b400",
  color: "white",
  cursor: "pointer",
  minWidth: "120px"
};
