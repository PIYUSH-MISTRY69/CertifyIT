import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "./firebase";
import OrganizerDashboard from "./OrganizerDashboard";
import ParticipantAccess from "./ParticipantAccess";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import MyCertificates from "./MyCertificates";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);

  const login = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setUser(result.user);
      })
      .catch((err) => {
        console.error("Login error", err);
      });
  };

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  return () => unsubscribe();
}, []);


  return (
    <Router>
      <Routes>
      <Route
  path="/"
  element={
    !user ? (
  <div
    style={{
      height: "100vh",
      background: "linear-gradient(to right, #621708, #8B1E3F)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "Segoe UI, sans-serif",
    }}
  >
    <div
      style={{
        backgroundColor: "#fff",
        padding: "3rem",
        borderRadius: "12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
        textAlign: "center",
        width: "90%",
        maxWidth: "420px",
      }}
    >
      <h1
        style={{
          marginBottom: "1.5rem",
          fontSize: "2.5rem",
          color: "#621708",
          letterSpacing: "1px",
        }}
      >
        Certify<span style={{ color: "#F6AA1C" }}>IT</span>
      </h1>
      <p style={{ color: "#444", marginBottom: "2rem" }}>
        Sign in to access your certificates
      </p>
      <button
        onClick={login}
        style={{
          padding: "12px 24px",
          fontSize: "1rem",
          fontWeight: "bold",
          backgroundColor: "#F6AA1C",
          color: "#621708",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          transition: "transform 0.2s, background 0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#FFD449")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#F6AA1C")}
        onMouseDown={(e) => (e.target.style.transform = "scale(0.98)")}
        onMouseUp={(e) => (e.target.style.transform = "scale(1)")}
      >
        Sign in with Google
      </button>
    </div>
  </div>
) : (
  user.email === "certifyit.org.demo@gmail.com" ? (
    <OrganizerDashboard user={user} />
  ) : (
    <ParticipantAccess />
  )
)


  }
/>
        <Route path="/participant" element={<ParticipantAccess />} />
        {/* Optional: redirect unknown paths */}
        <Route path="/mycertificates" element={<MyCertificates />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

