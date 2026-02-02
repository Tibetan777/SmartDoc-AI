import { useState } from "react";

export default function SmartUploadModal({ onClose, onUploadSuccess }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [analysis, setAnalysis] = useState([]);
    const [step, setStep] = useState(1); // 1: Select, 2: Analyze, 3: Confirm

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setSelectedFiles(files);
        setStep(2);

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
            setStep(3);
        } catch (err) { alert("Analysis failed"); setStep(1); }
    };

    const handleUpload = async () => {
        // ... (Use same logic as before for uploading) ...
        // เพื่อความกระชับ ขอใช้ Logic เดิมแต่เปลี่ยน UI
        try {
            for (const item of analysis) {
                const file = selectedFiles.find(f => f.name === item.fileName);
                if (!file) continue;
                const base64String = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(file);
                });
                await fetch("/api/files/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                    body: JSON.stringify({ fileName: file.name, fileData: base64String, folderId: null, tags: [item.suggestedFolder] })
                });
            }
            onUploadSuccess();
        } catch (err) { alert("Upload failed"); }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ width: 500 }}>
                <h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Smart Upload
                    <span onClick={onClose} style={{ cursor: 'pointer', color: '#999' }}>✕</span>
                </h3>

                {step === 1 && (
                    <div style={{ border: '2px dashed #E5E7EB', padding: 40, textAlign: 'center', borderRadius: 12, cursor: 'pointer', background: '#F9FAFB' }}>
                        <input type="file" id="fileInput" multiple onChange={handleFileChange} hidden />
                        <label htmlFor="fileInput" style={{ cursor: 'pointer', color: '#1A73E8', fontWeight: 600 }}>
                            Click to select files
                        </label>
                        <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>PDF, DOCX, JPG supported</p>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <div className="spinner" style={{ marginBottom: 20 }}>🤖</div>
                        <p>AI is analyzing your documents...</p>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 20, border: '1px solid #E5E7EB', borderRadius: 8 }}>
                            {analysis.map((item, i) => (
                                <div key={i} style={{ padding: '12px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                    <span>{item.fileName}</span>
                                    <span style={{ background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>
                                        {item.suggestedFolder}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={onClose}>Cancel</button>
                            <button className="btn-confirm" onClick={handleUpload}>Confirm & Upload</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}