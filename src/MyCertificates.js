import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const allCerts = JSON.parse(localStorage.getItem("certificates") || "[]");
    const currentName = localStorage.getItem("participantName")?.trim().toLowerCase();

    if (currentName) {
      const seen = new Set();
      const filtered = allCerts
        .filter(cert => cert.name?.trim().toLowerCase() === currentName)
        .filter(cert => {
          const uniqueKey = cert.name + cert.url;
          if (seen.has(uniqueKey)) return false;
          seen.add(uniqueKey);
          return true;
        });

      setCertificates(filtered);
    } else {
      setCertificates([]);
    }
  }, []);

  const handleDelete = (index) => {
    const currentName = localStorage.getItem("participantName")?.trim().toLowerCase();
    const allCerts = JSON.parse(localStorage.getItem("certificates") || "[]");

    const filtered = allCerts.filter(cert =>
      cert.name?.trim().toLowerCase() === currentName
    );

    const updated = [...filtered];
    updated.splice(index, 1);

    const remainingCerts = allCerts.filter(cert =>
      cert.name?.trim().toLowerCase() !== currentName
    );

    const newStored = [...remainingCerts, ...updated];
    localStorage.setItem("certificates", JSON.stringify(newStored));
    setCertificates(updated);
  };

  const handleDownload = (cert) => {
    const link = document.createElement("a");
    link.href = cert.url;
    link.download = `${cert.name || "certificate"}_certificate.png`;
    link.click();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to right, #621708, #8B1E3F)",
      color: "#F6AA1C",
      padding: "2rem",
      fontFamily: "Segoe UI, sans-serif"
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        color: "#333"
      }}>
        <h2 style={{ textAlign: "center", color: "#621708", marginBottom: "1.5rem" }}>
          My Certificates
        </h2>

        {certificates.length === 0 ? (
          <p style={{ textAlign: "center" }}>No certificates found.</p>
        ) : (
          certificates.map((cert, i) => (
            <div
              key={i}
              style={{
                marginBottom: "3rem",
                backgroundColor: "#f9f9f9",
                padding: "1rem",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                position: "relative"
              }}
            >
              <p><strong>Name:</strong> {cert.name || "Unknown"}</p>
              <img
                src={cert.url}
                alt={`Certificate ${i + 1}`}
                style={{
                  width: "100%",
                  maxHeight: "500px",
                  objectFit: "contain",
                  border: "2px solid #ddd",
                  borderRadius: "8px"
                }}
              />

              {/* Download Button */}
              <button
                onClick={() => handleDownload(cert)}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#1abc9c',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  float: 'left'
                }}
              >
                Download
              </button>

              {/* Delete Button */}
              <button
                onClick={() => handleDelete(i)}
                style={{
                  marginTop: '10px',
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  float: 'right'
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: '1rem',
              padding: '10px 24px',
              backgroundColor: '#F6AA1C',
              color: '#621708',
              border: 'none',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#FFD449"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#F6AA1C"}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCertificates;
