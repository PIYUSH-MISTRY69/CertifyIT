import React, { useState } from "react";
import { db, storage } from "./firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import Papa from "papaparse";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

function OrganizerDashboard({ user }) {
  const [eventName, setEventName] = useState("");
  const [templateFile, setTemplateFile] = useState(null);
  const [templatePreviewURL, setTemplatePreviewURL] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [eventKey, setEventKey] = useState("");
  const [copied, setCopied] = useState(false);
  const [namePosition, setNamePosition] = useState(null);
  const [useDefault, setUseDefault] = useState(false);

  const navigate = useNavigate();

  const handleCSV = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const names = results.data.map((row) => row.name?.trim());
        setParticipants(names.filter(Boolean));
      },
    });
  };

  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    setTemplateFile(file);
    const url = URL.createObjectURL(file);
    setTemplatePreviewURL(url);
  };

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setNamePosition({ xPercent: x, yPercent: y });
  };

  const handleDefaultToggle = async (checked) => {
  setUseDefault(checked);
  if (checked) {
    try {
      // ✅ Load default certificate from Firebase Storage
      const defaultTemplatePath = "templates/e8a419e4-a296-47a3-b885-bc48c74f917c.png";
      const defaultRef = ref(storage, defaultTemplatePath);
      const url = await getDownloadURL(defaultRef);
      const blob = await fetch(url).then((r) => r.blob());
      const file = new File([blob], "default-template.png", { type: "image/png" });
      setTemplateFile(file);
      setTemplatePreviewURL(URL.createObjectURL(file));

      // ✅ Load default participants from Firestore
      const q = query(collection(db, "defaults"), where("type", "==", "defaultEvent"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("No default participants found in Firestore.");
      }

      const data = snapshot.docs[0].data();
      const names = data.participants?.map((n) => n.trim()) || [];

      if (!names.length) {
        throw new Error("Default participant list is empty.");
      }

      setParticipants(names);
    } catch (err) {
      console.error("❌ Error loading defaults:", err.message || err);
      alert("⚠️ Failed to load default template or participants. Check Firebase setup.");
      setUseDefault(false);
    }
  } else {
    setTemplateFile(null);
    setTemplatePreviewURL(null);
    setCsvFile(null);
    setParticipants([]);
  }
};


  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventName || !templateFile || participants.length === 0 || !namePosition) {
      alert("Please fill all required fields and click on the template to set name position.");
      return;
    }

    const eventId = uuidv4();
    const storageRef = ref(storage, `templates/${eventId}.png`);
    await uploadBytes(storageRef, templateFile);
    const templateURL = await getDownloadURL(storageRef);

    await addDoc(collection(db, "events"), {
      eventId,
      eventName,
      organizerEmail: user.email,
      templateURL,
      participants,
      namePosition,
      createdAt: new Date().toISOString(),
    });

    setEventKey(eventId);
    alert("✅ Event created! Share the key with participants.");
    setEventName("");
    setTemplateFile(null);
    setTemplatePreviewURL(null);
    setCsvFile(null);
    setParticipants([]);
    setNamePosition(null);
    setUseDefault(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to right, #621708, #8B1E3F)",
      color: "#F6AA1C",
      fontFamily: "Segoe UI, sans-serif",
      padding: "2rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        backgroundColor: "#fff",
        color: "#333",
        borderRadius: "12px",
        padding: "2rem 3rem",
        maxWidth: "600px",
        width: "100%",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }}>
        <h2 style={{ color: "#621708", marginBottom: "1.5rem", textAlign: "center" }}>
          Welcome, {user.displayName}
        </h2>

        <input
          type="text"
          placeholder="Enter Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <input
            type="checkbox"
            checked={useDefault}
            onChange={(e) => handleDefaultToggle(e.target.checked)}
            style={{ marginRight: "8px" }}
          />
          Use default certificate and participant list
        </label>

        <label style={{ fontWeight: "bold" }}>Upload Certificate Template (PNG):</label>
        <input
          type="file"
          accept=".png"
          onChange={handleTemplateUpload}
          disabled={useDefault}
          style={{ margin: "0.5rem 0 1rem 0" }}
        />
        <br></br>
        {templatePreviewURL && (
          <>
            <p><strong>Click on the template to set name position</strong></p>
            <div
              style={{
                width: "100%",
                maxHeight: "400px",
                overflow: "auto",
                marginBottom: "1rem",
                border: "1px solid #ddd"
              }}
            >
              <img
                src={templatePreviewURL}
                alt="Template Preview"
                onClick={handleImageClick}
                style={{ width: "100%", cursor: "crosshair" }}
              />
            </div>
            {namePosition && (
              <p style={{ marginBottom: "1rem", color: "#27ae60" }}>
                Name will appear at: <strong>{namePosition.xPercent.toFixed(1)}%</strong> from left and <strong>{namePosition.yPercent.toFixed(1)}%</strong> from top
              </p>
            )}
          </>
        )}

        <label style={{ fontWeight: "bold" }}>Upload Participants CSV (name column):</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSV}
          disabled={useDefault}
          style={{ margin: "0.5rem 0 1rem 0" }}
        />

        <p>Parsed Participants: <strong>{participants.length}</strong></p>

        {eventKey && (
          <div style={{
            backgroundColor: "#f4f4f4",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            textAlign: "center",
            border: "1px dashed #ccc"
          }}>
            <p style={{ fontWeight: "bold", color: "#621708" }}>Event Key:</p>
            <code style={{
              backgroundColor: "#fff",
              padding: "8px 16px",
              borderRadius: "6px",
              fontSize: "1rem",
              color: "#333"
            }}>{eventKey}</code>
            <br />
            <button
              onClick={() => {
                navigator.clipboard.writeText(eventKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              style={{
                marginTop: "0.5rem",
                padding: "8px 12px",
                backgroundColor: copied ? "#27ae60" : "#3498db",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              {copied ? "Copied!" : "Copy Event Key"}
            </button>
          </div>
        )}

        <button
          onClick={handleCreateEvent}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#F6AA1C",
            color: "#621708",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            marginTop: "1rem",
            cursor: "pointer"
          }}
        >
          Create Event - takes 5 seconds
        </button>

        <button
          onClick={handleSignOut}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#e74c3c",
            color: "#fff",
            fontWeight: "bold",
            border: "none",
            borderRadius: "8px",
            marginTop: "1rem",
            cursor: "pointer"
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default OrganizerDashboard;
