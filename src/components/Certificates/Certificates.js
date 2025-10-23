import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { FaAward, FaGraduationCap, FaStar } from "react-icons/fa";
import CertificateButton from "./CertificateButton";
import Loader from "../Shared/Loader/Loader";
import "./Certificates.css";

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await API.get("/user/passed-results?pass=true");
        if (res.data.success && Array.isArray(res.data.results)) {
          setCertificates(res.data.results);
        } else {
          setCertificates([]); // no results found
        }
      } catch (error) {
        console.error("❌ Error fetching certificates:", error);
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) return <Loader />;

  if (certificates.length === 0)
    return (
      <div className="cert-empty fade-in">
        <FaAward className="cert-empty-icon" />
        <p>No certificates available yet</p>
      </div>
    );

  return (
    <div className="cert-wrap">
      <div className="cert-header">
        <FaGraduationCap className="cert-header-icon" />
        <h2>Your Achievements</h2>
      </div>

      <div className="cert-grid">
        {certificates.map((item) => (
          <div className="cert-card fade-in" key={item.resultId}>
            <div className="cert-icon">
              <FaStar />
            </div>
            <h3 className="cert-title">{item.quizTitle}</h3>

            <div className="cert-meta">
              <span className={`cert-level ${item.level?.toLowerCase()}`}>
                {item.level}
              </span>
              <span className="cert-score">
                🏆 Score: <strong>{item.score}%</strong>
              </span>
            </div>

            <CertificateButton resultId={item.resultId} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificates;
