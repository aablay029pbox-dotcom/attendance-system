"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserMultiFormatReader } from "@zxing/library";
import { supabase } from "../../lib/supabase";

export default function ScanPage() {
  const router = useRouter();
  const [hostInfo, setHostInfo] = useState(null);
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(true);
  const [recentScans, setRecentScans] = useState(new Set()); // prevent duplicates
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  useEffect(() => {
    const host = sessionStorage.getItem("hostInfo");
    if (!host) {
      router.push("/host");
      return;
    }
    const parsedHost = JSON.parse(host);
    setHostInfo(parsedHost);

    codeReaderRef.current = new BrowserMultiFormatReader();
    startScanner(parsedHost);

    return () => {
      if (codeReaderRef.current) codeReaderRef.current.reset();
    };
  }, []);

  // Scanner only starts after hostInfo is loaded
  const startScanner = async (host) => {
    if (!videoRef.current) return;

    try {
      await codeReaderRef.current.decodeFromVideoDevice(
        null, // default camera
        videoRef.current,
        async (result, err) => {
          if (result && scanning) {
            setScanning(false); // temporarily stop scanning
            await handleScan(result.getText(), host);
            setTimeout(() => setScanning(true), 2000); // resume after 2 seconds
          }
          if (err && err.name !== "NotFoundException") {
            console.error(err);
          }
        }
      );
    } catch (err) {
      console.error("Scanner init error:", err);
      setMessage("Failed to start scanner. Check camera permissions.");
    }
  };

  // Handle scanned QR
  const handleScan = async (scannedText, host) => {
    if (!scannedText) return;

    let studentId;
    try {
      const data = JSON.parse(scannedText);
      studentId = data.id?.trim();
      if (!studentId) throw new Error("No ID found in QR");
    } catch {
      setMessage("Invalid QR code format");
      return;
    }

    // Prevent duplicate inserts from multiple scans
    if (recentScans.has(studentId)) {
      setMessage(`Already scanned: ${studentId}`);
      return;
    }

    setRecentScans((prev) => new Set(prev).add(studentId));
    setTimeout(() => {
      setRecentScans((prev) => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }, 5000); // allow re-scan after 5 seconds

    try {
      // Check if student already marked in DB
      const { data: existing, error: checkError } = await supabase
        .from("attendance")
        .select("*")
        .eq("student_id", studentId)
        .eq("host_id", host.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existing) {
        setMessage(`Student ID ${studentId} already marked!`);
        return;
      }

      // Insert attendance
      const { error } = await supabase.from("attendance").insert([
        { student_id: studentId, host_id: host.id },
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
        <button style={buttonStyle} onClick={() => router.push("/host/dashboard")}>
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
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  padding: "20px",
};

const buttonStyle = {
  padding: "12px 30px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#f4b400",
  color: "white",
  cursor: "pointer",
  width: "180px",
};
