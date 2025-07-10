import React, { useState, useRef } from 'react';
import { query, where, getDocs, collection } from 'firebase/firestore';
import { db, storage, auth } from './firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import html2canvas from 'html2canvas';

const ParticipantAccess = () => {
  const [eventKey, setEventKey] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [certificateURL, setCertificateURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [namePosition, setNamePosition] = useState({ x: 400, y: 300 }); // default fallback

  const navigate = useNavigate();
  const certRef = useRef(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  const handleAccess = async () => {
    setLoading(true);
    setError('');
    setCertificateURL('');

    try {
      const q = query(collection(db, "events"), where("eventId", "==", eventKey.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("❌ Event not found. Check the key.");
        setLoading(false);
        return;
      }

      const eventData = querySnapshot.docs[0].data();
      const participantList = eventData.participants.map(p => p.trim().toLowerCase());
      const nameMatch = name.trim().toLowerCase();

      if (!participantList.includes(nameMatch)) {
        setError("❌ Name not found in participant list.");
        setLoading(false);
        return;
      }

      localStorage.setItem("participantName", nameMatch);

      const templateRef = ref(storage, `templates/${eventData.eventId}.png`);
      const templateURL = await getDownloadURL(templateRef);
      setCertificateURL(templateURL);

      if (eventData.namePosition) {
        setNamePosition(eventData.namePosition);
      }

    } catch (err) {
      console.error(err);
      setError("⚠️ Something went wrong.");
    }

    setLoading(false);
  };

  const downloadCertificate = async () => {
    const element = certRef.current;
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: false,
    });
    const dataURL = canvas.toDataURL("image/png");

    const stored = JSON.parse(localStorage.getItem("certificates") || "[]");
    const participantName = name.trim();

    const alreadyExists = stored.some(cert =>
      cert.name === participantName && cert.url === dataURL
    );

    if (!alreadyExists) {
      stored.push({
        name: participantName,
        url: dataURL,
        downloadedAt: new Date().toISOString()
      });
      localStorage.setItem("certificates", JSON.stringify(stored));
    }

    const link = document.createElement("a");
    link.download = `${name}_certificate.png`;
    link.href = dataURL;
    link.click();
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
        <h2 style={{ textAlign: "center", color: "#621708", marginBottom: "2rem" }}>
          Access Your Certificate
        </h2>

        <input
          type="text"
          placeholder="Enter Event Key"
          value={eventKey}
          onChange={(e) => setEventKey(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <input
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "1.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <div style={{ display: 'flex', gap: '1rem', marginBottom: "1rem" }}>
          <button
            onClick={handleAccess}
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              backgroundColor: "#F6AA1C",
              color: "#621708",
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            {loading ? 'Checking...' : 'Get Certificate'}
          </button>

          <button
            onClick={handleSignOut}
            style={{
              backgroundColor: "#e74c3c",
              color: "#fff",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Sign Out
          </button>

          <button
            onClick={() => navigate("/mycertificates")}
            style={{
              backgroundColor: "#1abc9c",
              color: "#fff",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            My Certificates
          </button>
        </div>

        {error && <p style={{ color: 'red', textAlign: "center" }}>{error}</p>}

        {certificateURL && (
          <>
            <h3 style={{ textAlign: "center", marginTop: "2rem", color: "#621708" }}>
              Your Certificate
            </h3>
            <div
              ref={certRef}
              style={{
                position: 'relative',
                display: 'block',
                width: '100%',
                maxWidth: '800px',
                height: '600px',
                margin: '1rem auto',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src={certificateURL}
                alt="Certificate"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                crossOrigin="anonymous"
              />
              <div
  style={{
    position: 'absolute',
    top: `${namePosition.yPercent || 50}%`,
    left: `${namePosition.xPercent || 50}%`,
    transform: 'translate(-50%, -50%)',
    fontSize: '30px',
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'Arial, sans-serif',
    whiteSpace: 'nowrap',
    textAlign: 'center'
  }}
>
  {name}
</div>

            </div>
            <div style={{ textAlign: "center" }}>
              <button
                onClick={downloadCertificate}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#3498db",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Download My Certificate
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ParticipantAccess;
