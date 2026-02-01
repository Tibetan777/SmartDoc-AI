import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DocumentWorkspace.css"; // อย่าลืมสร้างไฟล์ CSS นี้ด้วย (โค้ดอยู่ด้านล่าง)

export default function DocumentWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [chatLog, setChatLog] = useState([]);
  const [inputMsg, setInputMsg] = useState("");

  useEffect(() => {
    // โหลดไฟล์
    fetch(`/api/files/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setFile(data);
        setChatLog([
          {
            role: "ai",
            text: `สวัสดีครับ! ผมพร้อมช่วยวิเคราะห์เอกสาร "${data.file_name}" แล้วครับ`,
          },
        ]);
      })
      .catch(() => navigate("/"));
  }, [id]);

  const handleSend = () => {
    if (!inputMsg) return;
    setChatLog([...chatLog, { role: "user", text: inputMsg }]);
    setInputMsg("");
    // Mock ตอบกลับ
    setTimeout(() => {
      setChatLog((prev) => [
        ...prev,
        {
          role: "ai",
          text: "นี่คือคำตอบจำลองจาก AI (ระบบจริงต้องเชื่อม OpenAI)",
        },
      ]);
    }, 800);
  };

  if (!file) return <div className="workspace-loading">Loading...</div>;

  return (
    <div className="workspace-container">
      {/* ซ้าย: ดูเอกสาร */}
      <div className="doc-viewer">
        <div className="viewer-header">
          <h3>📄 {file.file_name}</h3>
          <button onClick={() => navigate("/")} className="btn-close">
            ✕ Close
          </button>
        </div>
        <div className="viewer-body">
          <iframe src={`/uploads/${file.file_path}`} title="doc" />
        </div>
      </div>

      {/* ขวา: AI Chat */}
      <div className="ai-panel">
        <div className="ai-tabs">
          <button
            className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            💬 Chat
          </button>
          <button
            className={`tab-btn ${activeTab === "summary" ? "active" : ""}`}
            onClick={() => setActiveTab("summary")}
          >
            📝 Summary
          </button>
        </div>

        <div className="ai-content">
          {activeTab === "chat" ? (
            <div className="chat-box">
              <div className="messages">
                {chatLog.map((m, i) => (
                  <div key={i} className={`msg ${m.role}`}>
                    {m.text}
                  </div>
                ))}
              </div>
              <div className="input-area">
                <input
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask AI..."
                />
                <button onClick={handleSend}>Send</button>
              </div>
            </div>
          ) : (
            <div className="summary-box">
              <h4>บทสรุปโดย AI</h4>
              <p>{file.content_summary || "กำลังประมวลผล..."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
