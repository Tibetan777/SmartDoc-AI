import { useState } from "react";

export default function SmartUploadModal({ onClose, onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 1. เลือกไฟล์และส่งไปวิเคราะห์ (Mock AI)
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles(files);
    setIsAnalyzing(true);

    try {
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
    } catch (err) {
      alert("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. แปลงไฟล์เป็น Base64 และอัปโหลดจริง
  const handleUpload = async () => {
    setIsUploading(true);
    try {
      // Loop อัปโหลดทีละไฟล์
      for (const item of analysis) {
        const file = selectedFiles.find((f) => f.name === item.fileName);
        if (!file) continue;

        // แปลงไฟล์เป็น Base64
        const base64String = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });

        // ยิง API Upload
        await fetch("/api/files/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            fileName: file.name,
            fileData: base64String,
            folderId: null, // ในอนาคตสามารถ map folderId จาก suggestedFolder ได้
            tags: [item.suggestedFolder],
          }),
        });
      }
      onUploadSuccess(); // แจ้ง Dashboard ว่าเสร็จแล้ว
    } catch (err) {
      alert("Upload failed: " + err.message);
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>📄 Smart Bulk Upload</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="upload-area">
          <input
            type="file"
            id="fileInput"
            multiple
            onChange={handleFileChange}
            hidden
          />
          <label htmlFor="fileInput" className="upload-label">
            {selectedFiles.length === 0
              ? "Click to Select Files"
              : `${selectedFiles.length} files selected`}
          </label>
        </div>

        {isAnalyzing && (
          <div className="status-text">🤖 AI is analyzing categories...</div>
        )}
        {isUploading && (
          <div className="status-text">⏳ Uploading to secure cloud...</div>
        )}

        <div className="analysis-list">
          {analysis.map((item, idx) => (
            <div key={idx} className="analysis-item">
              <span className="file-name">{item.fileName}</span>
              <span className="arrow">➔</span>
              <span className="folder-badge">{item.suggestedFolder}</span>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-confirm"
            onClick={handleUpload}
            disabled={analysis.length === 0 || isUploading}
          >
            {isUploading ? "Uploading..." : "Confirm & Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
