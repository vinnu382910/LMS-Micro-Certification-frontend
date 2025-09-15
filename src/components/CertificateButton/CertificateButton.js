import API from "../../api/api";
import "./CertificateButton.css";

const CertificateButton = ({ name, quizTitle, score }) => {
  const handleDownload = async () => {
    try {
      const response = await API.post(
        "/certificate",
        { name, quizTitle, score },
        { responseType: "blob" } // important for PDF
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate_${name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Certificate download failed:", err);
      alert(
        "Failed to download certificate. Please check backend is running and CORS is enabled."
      );
    }
  };

  return (
    <button className="certificate-btn" onClick={handleDownload}>
      Download Certificate
    </button>
  );
};

export default CertificateButton;
