import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function DocumentWorkspace() {
  const { id } = useParams();
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetch(`/api/files/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setFile(data));
  }, [id]);

  return (
    <div
      className="workspace-container"
      style={{ display: "flex", height: "100vh" }}
    >
      {/* ฝั่งซ้าย: ตัวดูเอกสาร */}
      <div
        className="viewer-panel"
        style={{ flex: 1, borderRight: "1px solid #ddd" }}
      >
        {file ? (
          <iframe
            src={`/uploads/${file.file_path}`}
            width="100%"
            height="100%"
            title="Document Viewer"
          />
        ) : (
          <p>กำลังโหลดเอกสาร...</p>
        )}
      </div>

      {/* ฝั่งขวา: AI Assistant */}
      <div
        className="ai-panel"
        style={{ width: "400px", display: "flex", flexDirection: "column" }}
      >
        <div
          className="ai-header"
          style={{ padding: "20px", borderBottom: "1px solid #ddd" }}
        >
          <h3>AI Assistant</h3>
        </div>
        <div
          className="chat-history"
          style={{ flex: 1, padding: "20px", overflowY: "auto" }}
        >
          <div className="ai-message">
            สวัสดีครับ! ผมเป็น AI ผู้ช่วยส่วนตัวของคุณ
            มีอะไรให้ช่วยวิเคราะห์เอกสารนี้ไหมครับ?
          </div>
        </div>
        <div
          className="chat-input"
          style={{ padding: "20px", borderTop: "1px solid #ddd" }}
        >
          <input
            type="text"
            placeholder="ถาม AI เกี่ยวกับเอกสารนี้..."
            style={{ width: "100%", padding: "10px" }}
          />
        </div>
      </div>
    </div>
  );
}
