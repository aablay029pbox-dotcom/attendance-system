"use client";

import QRCode from "react-qr-code";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function QRPage() {
  const router = useRouter();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("studentInfo");

    if (!data) {
      router.push("/student");
    } else {
      setStudent(JSON.parse(data));
    }
  }, [router]);

  if (!student) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* Header */}
      <header style={{ backgroundColor: "#FFD700", padding: "20px", textAlign: "center" }}>
        <h1>Your QR Code</h1>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "25px"
        }}
      >

        {/* ✅ White QR Background Card */}
        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
          }}
        >
          <QRCode
            value={JSON.stringify(student)}
            size={220}
            bgColor="#FFFFFF"
            fgColor="#000000"
          />
        </div>

        {/* Student Info */}
        <div style={{ textAlign: "center" }}>
          <p><strong>Last Name:</strong> {student.lastname}</p>
          <p><strong>First Name:</strong> {student.firstname}</p>
          <p><strong>Course:</strong> {student.course}</p>
          <p><strong>Year & Section:</strong> {student.yearsection}</p>
        </div>

        <button
          onClick={() => router.push("/")}
          style={buttonStyle}
        >
          Back to Home
        </button>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#FFD700", padding: "15px", textAlign: "center" }}>
        <p>© 2026</p>
      </footer>

    </div>
  );
}

const buttonStyle = {
  padding: "12px 30px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#f4b400",
  color: "white",
  cursor: "pointer"
};
