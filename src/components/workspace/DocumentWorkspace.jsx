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
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, borderRight: "1px solid #ddd" }}>
        {file ? (
          <iframe
            src={`/uploads/${file.file_path}`}
            width="100%"
            height="100%"
            title="viewer"
          />
        ) : (
          <p>กำลังโหลดไฟล์...</p>
        )}
      </div>
      <div
        style={{
          width: "400px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3>AI Assistant</h3>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#f9f9f9",
            padding: "15px",
            borderRadius: "8px",
          }}
        >
          <p>
            <b>AI:</b> สรุปเนื้อหาสำคัญในเอกสารฉบับนี้คือ...
          </p>
        </div>
        <input
          type="text"
          placeholder="ถาม AI เกี่ยวกับไฟล์นี้..."
          style={{ marginTop: "15px", padding: "10px" }}
        />
      </div>
    </div>
  );
}
