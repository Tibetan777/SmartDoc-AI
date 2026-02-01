import { useState } from "react";

export default function SmartUploadModal({ onClose, onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setIsAnalyzing(true);

    // จำลองการเรียก AI Analyze
    const res = await fetch("/api/files/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ files: files.map((f) => f.name) }),
    });
    const data = await res.json();
    setAnalysis(data);
    setIsAnalyzing(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Smart Bulk Upload</h2>
        <input type="file" multiple onChange={handleFileChange} />

        {isAnalyzing && <p>AI กำลังวิเคราะห์ไฟล์...</p>}

        <div className="analysis-list">
          {analysis.map((item, idx) => (
            <div key={idx} className="analysis-item">
              <span>{item.fileName}</span>
              <strong>แนะนำโฟลเดอร์: {item.suggestedFolder}</strong>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>ยกเลิก</button>
          <button className="btn-primary" disabled={analysis.length === 0}>
            ยืนยันและอัปโหลด
          </button>
        </div>
      </div>
    </div>
  );
}
