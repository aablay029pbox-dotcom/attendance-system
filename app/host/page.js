"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function HostLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("hosts")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (error || !data) {
        alert("Invalid username or password");
        return;
      }

      // Save host info in session
      sessionStorage.setItem(
        "hostInfo",
        JSON.stringify({ id: data.id, username: data.username })
      );

      router.push("/host/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={headerFooterStyle}>
        <h1>Host Login</h1>
      </header>

      <main style={mainStyle}>
        <form
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}
        >
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          {/* Buttons aligned in a row */}
          <div style={{ display: "flex", gap: "15px" }}>
            <button type="submit" style={buttonStyle}>Login</button>
            <button type="button" style={buttonStyle} onClick={() => router.push("/")}>
              Back
            </button>
          </div>
        </form>
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
  gap: "15px",
  padding: "20px"
};

const inputStyle = {
  padding: "12px",
  width: "250px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const buttonStyle = {
  padding: "12px 30px",
  fontSize: "16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#f4b400",
  color: "white",
  cursor: "pointer",
  width: "120px"
};
