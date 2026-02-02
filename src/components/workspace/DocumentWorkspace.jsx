import { useState, useEffect, useRef } from "react";
import "./DocumentWorkspace.css";

// Icons
const ScanIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5" /><path d="M3 12v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" /><path d="M12 12v9" /><path d="M8 17l4 4 4-4" /><path d="M4 4h16" /></svg>;
const CheckArrowIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const SparklesIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.272 1.272L21 12l-5.813 1.912a2 2 0 0 0-1.272 1.272L12 21l-1.912-5.813a2 2 0 0 0-1.272-1.272L3 12l5.813-1.912a2 2 0 0 0 1.272-1.272L12 3z"></path></svg>;
const CloseIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

// รับ fileId และ onClose จาก Dashboard โดยตรง
export default function DocumentWorkspace({ fileId, onClose }) {
    const [file, setFile] = useState(null);
    const [chatLog, setChatLog] = useState([]);
    const [inputMsg, setInputMsg] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!fileId) return;

        // โหลดข้อมูลไฟล์
        fetch(`/api/files/${fileId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
            .then(res => res.json())
            .then(data => {
                setFile(data);
                setChatLog([{ role: "ai", text: `สวัสดีครับ! ผมพร้อมช่วยคุณวิเคราะห์เอกสาร "${data.file_name}" แล้วครับ` }]);
            })
            .catch(err => console.error("Load file error:", err));
    }, [fileId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [chatLog, isTyping]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;

        const userMsg = inputMsg;
        setChatLog(prev => [...prev, { role: "user", text: userMsg }]);
        setInputMsg("");
        setIsTyping(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ message: userMsg, fileId: fileId })
            });
            const data = await res.json();
            setChatLog(prev => [...prev, data]);
        } catch (err) {
            setTimeout(() => {
                // Mock Response กรณี Server ยังไม่พร้อม
                const mockReply = userMsg.includes("สรุป")
                    ? "จากการวิเคราะห์ สาระสำคัญคือ..."
                    : `ระบบได้รับข้อความ "${userMsg}" แล้ว (Mock AI)`;
                setChatLog(prev => [...prev, { role: "ai", text: mockReply }]);
            }, 1000);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSummarize = () => {
        setChatLog(prev => [...prev, { role: "user", text: "ช่วยสรุปเนื้อหาเอกสารนี้ให้หน่อย" }]);
        setIsTyping(true);
        setTimeout(() => {
            setChatLog(prev => [...prev, {
                role: "ai",
                text: file?.content_summary || "เอกสารนี้เกี่ยวกับ... (กำลังประมวลผล Mock Summary)"
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const handleOCR = () => {
        alert("กำลังแปลงภาพลายมือเป็นข้อความ... (OCR System Started)");
    };

    if (!file) return <div className="loading-state">Loading Document...</div>;

    return (
        <div className="workspace-container">
            {/* HEADER ของ Workspace (ปุ่มปิดอยู่ตรงนี้) */}
            <div className="workspace-header">
                <div className="ws-file-info">
                    <span className="ws-icon">📄</span>
                    <span className="ws-title">{file.file_name}</span>
                </div>
                <div className="ws-actions">
                    <button className="btn-tool" onClick={handleOCR}>
                        <ScanIcon /> แปลงลายมือ (OCR)
                    </button>
                    <button className="btn-close" onClick={onClose} title="Close File">
                        <CloseIcon />
                    </button>
                </div>
            </div>

            <div className="workspace-body">
                {/* LEFT: Viewer */}
                <div className="doc-viewer-panel">
                    <iframe src={`/uploads/${file.file_path}`} title="doc-preview" />
                </div>

                {/* RIGHT: AI Assistant */}
                <div className="ai-panel">
                    <div className="ai-header">
                        <h3>AI Assistant</h3>
                        {/* Magic Sum Button */}
                        <div className="magic-sum-container">
                            <button className="btn-magic-sum" onClick={handleSummarize}>
                                <span className="icon-state"><CheckArrowIcon /></span>
                                <span className="text-state"><SparklesIcon /> Sum</span>
                            </button>
                        </div>
                    </div>

                    <div className="chat-messages">
                        {chatLog.map((msg, i) => (
                            <div key={i} className={`message ${msg.role}`}>
                                <div className="bubble">{msg.text}</div>
                            </div>
                        ))}
                        {isTyping && <div className="typing-indicator">AI is thinking...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="ถามคำถาม..."
                            value={inputMsg}
                            onChange={e => setInputMsg(e.target.value)}
                        />
                        <button type="submit" disabled={!inputMsg.trim()}>ส่ง</button>
                    </form>
                </div>
            </div>
        </div>
    );
}