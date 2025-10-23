import React from "react";
import { FaDownload } from "react-icons/fa";
import API from "../../api/api";
import "./CertificateButton.css";

const CertificateButton = ({ name, resultId }) => {
  const handleDownload = async () => {
    try {
      const response = await API.post(
        "/certificate/download",
        { resultId },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate_${name || "Quiz"}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Certificate download failed:", err);
      alert("Failed to download certificate. Please ensure the backend is running.");
    }
  };

  return (
    <button className="certificate-btn" onClick={handleDownload}>
      <FaDownload className="cert-btn-icon" /> Download Certificate
    </button>
  );
};

export default CertificateButton;
