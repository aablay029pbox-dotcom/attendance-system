"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function StudentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    lastname: "",
    firstname: "",
    course: "",
    yearSection: ""
  });

  useEffect(() => {
    // Check if student already logged in today
    const student = localStorage.getItem("studentInfo");
    if (student) {
      const parsed = JSON.parse(student);
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      if (parsed.loginDate === today) {
        router.push("/student/qr");
      } else {
        // Reset if not today
        localStorage.removeItem("studentInfo");
      }
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const { lastname, firstname, course, yearSection } = formData;
    if (!lastname || !firstname || !course || !yearSection) {
      alert("Please complete all fields");
      return;
    }

    try {
      // Insert student if new
      const { data: inserted, error } = await supabase
        .from("students")
        .insert([
          { lastname, firstname, course, yearsection: yearSection }
        ])
        .select()
        .single();

      if (error) throw error;

      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const studentData = {
        id: inserted.id,
        firstname: inserted.firstname,
        lastname: inserted.lastname,
        course: inserted.course,
        yearsection: inserted.yearsection,
        loginDate: today // store current date
      };

      localStorage.setItem("studentInfo", JSON.stringify(studentData));

      router.push("/student/qr");
    } catch (err) {
      console.error(err);
      alert("Failed to save student info");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <header style={headerFooterStyle}><h1>Student Login</h1></header>
      <main style={mainStyle}>
        <input type="text" name="lastname" placeholder="Last Name" value={formData.lastname} onChange={handleChange} style={inputStyle} />
        <input type="text" name="firstname" placeholder="First Name" value={formData.firstname} onChange={handleChange} style={inputStyle} />
        <select name="course" value={formData.course} onChange={handleChange} style={inputStyle}>
          <option value="">Select Course</option>
          <option value="BSIT">BSIT</option>
          <option value="BSCS">BSCS</option>
          <option value="BSBA">BSBA</option>
        </select>
        <select name="yearSection" value={formData.yearSection} onChange={handleChange} style={inputStyle}>
          <option value="">Select Year & Section</option>
          <option value="1A">1A</option>
          <option value="2A">2A</option>
          <option value="3A">3A</option>
          <option value="4A">4A</option>
        </select>
        <button onClick={handleLogin} style={buttonStyle}>Login</button>
      </main>
      <footer style={headerFooterStyle}><p>© 2026</p></footer>
    </div>
  );
}

const headerFooterStyle = { backgroundColor: "#FFD700", padding: "20px", textAlign: "center" };
const mainStyle = { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "15px", padding: "20px" };
const inputStyle = { padding: "12px", width: "250px", borderRadius: "8px", border: "1px solid #ccc" };
const buttonStyle = { padding: "12px 30px", fontSize: "16px", borderRadius: "8px", border: "none", backgroundColor: "#f4b400", color: "white", cursor: "pointer", width: "180px" };
