import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DocumentWorkspace.css"; // แนะนำให้สร้าง CSS แยก ถ้ายังไม่มีให้ใส่ style inline ไปก่อนได้

export default function DocumentWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'summary'
  const [chatLog, setChatLog] = useState([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // โหลดข้อมูลไฟล์และสรุป
    fetch(`/api/files/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("File not found");
        return res.json();
      })
      .then((data) => {
        setFile(data);
        // เพิ่มข้อความต้อนรับ
        setChatLog([
          {
            role: "ai",
            text: `สวัสดีครับ! ผมพร้อมช่วยคุณวิเคราะห์เอกสาร "${data.file_name}" แล้ว ถามอะไรก็ได้เลยครับ`,
          },
        ]);
      })
      .catch(() => navigate("/"));
  }, [id, navigate]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg = inputMsg;
    setChatLog((prev) => [...prev, { role: "user", text: userMsg }]);
    setInputMsg("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: userMsg, fileId: id }),
      });
      const data = await res.json();
      setChatLog((prev) => [...prev, data]);
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        { role: "ai", text: "ขออภัย ระบบขัดข้องชั่วคราว" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, isTyping]);

  if (!file) return <div className="loading-screen">Loading Workspace...</div>;

  return (
    <div
      className="workspace-container"
      style={{ display: "flex", height: "100vh", background: "#f3f6fc" }}
    >
      {/* Left: Document Viewer (Epic 3) */}
      <div
        className="doc-viewer"
        style={{
          flex: 1.5,
          borderRight: "1px solid #e0e0e0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="viewer-header"
          style={{
            padding: "15px",
            background: "white",
            borderBottom: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h3>📄 {file.file_name}</h3>
          <button onClick={() => navigate("/")}>Close</button>
        </div>
        <div
          className="viewer-body"
          style={{
            flex: 1,
            background: "#525659",
            padding: "20px",
            overflow: "hidden",
          }}
        >
          {/* ใช้ Iframe แสดง PDF/Image */}
          <iframe
            src={`/uploads/${file.file_path}`}
            width="100%"
            height="100%"
            title="doc-preview"
            style={{ border: "none", background: "white" }}
          />
        </div>
      </div>

      {/* Right: AI Panel (Epic 4 & 5) */}
      <div
        className="ai-panel"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: "white",
        }}
      >
        {/* Tabs */}
        <div
          className="ai-tabs"
          style={{ display: "flex", borderBottom: "1px solid #ddd" }}
        >
          <button
            style={{
              flex: 1,
              padding: "15px",
              border: "none",
              background: activeTab === "chat" ? "white" : "#f9f9f9",
              borderBottom: activeTab === "chat" ? "2px solid #1A73E8" : "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => setActiveTab("chat")}
          >
            💬 AI Chat
          </button>
          <button
            style={{
              flex: 1,
              padding: "15px",
              border: "none",
              background: activeTab === "summary" ? "white" : "#f9f9f9",
              borderBottom:
                activeTab === "summary" ? "2px solid #1A73E8" : "none",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => setActiveTab("summary")}
          >
            📝 Summary
          </button>
        </div>

        {/* Tab Content */}
        <div
          className="ai-content"
          style={{ flex: 1, overflowY: "auto", padding: "20px" }}
        >
          {activeTab === "summary" && (
            <div className="summary-box">
              <h4 style={{ color: "#1A73E8" }}>บทสรุปโดย AI (Epic 4)</h4>
              <p style={{ lineHeight: "1.6", color: "#333" }}>
                {file.content_summary || "กำลังรอการประมวลผล..."}
              </p>

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <strong>Tags:</strong>
                {JSON.parse(file.tags || "[]").map((t) => (
                  <span
                    key={t}
                    style={{
                      marginLeft: "5px",
                      background: "#e8f0fe",
                      color: "#1967d2",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div
              className="chat-box"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <div className="messages" style={{ flex: 1 }}>
                {chatLog.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "15px",
                      textAlign: msg.role === "user" ? "right" : "left",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "10px 15px",
                        borderRadius: "12px",
                        background: msg.role === "user" ? "#1A73E8" : "#f1f3f4",
                        color: msg.role === "user" ? "white" : "#333",
                        maxWidth: "80%",
                        textAlign: "left",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div style={{ color: "#999", fontSize: "12px" }}>
                    AI is thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                style={{
                  marginTop: "auto",
                  paddingTop: "10px",
                  borderTop: "1px solid #eee",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="ถามเกี่ยวกับเอกสารนี้..."
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "20px",
                    border: "1px solid #ddd",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "#1A73E8",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
