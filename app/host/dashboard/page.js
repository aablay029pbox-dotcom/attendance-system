"use client";

import { useRouter } from "next/navigation";

export default function HostDashboard() {
  const router = useRouter();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={headerFooterStyle}>
        <h1>Host Dashboard</h1>
      </header>

      <main style={mainStyle}>
        <p>Welcome to the Host Dashboard</p>

        {/* Buttons aligned in a row */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <button onClick={() => router.push("/host")} style={buttonStyle}>
            Back
          </button>
          <button onClick={() => router.push("/host/scan")} style={buttonStyle}>
            Scan QR Code
          </button>
          <button onClick={() => router.push("/host/attendance")} style={buttonStyle}>
            Attendance
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
  gap: "30px",
  padding: "20px"
};

const buttonStyle = {
  padding: "16px 40px",
  fontSize: "18px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#f4b400",
  color: "white",
  cursor: "pointer",
  minWidth: "160px",
  textAlign: "center"
};
