import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SmartUploadModal from "./SmartUploadModal";
import DocumentWorkspace from "../workspace/DocumentWorkspace"; // Import เข้ามาใช้ในนี้
import "./Dashboard.css";

// Icons
const FolderIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
const FileIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>;
const PlusIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const LogOutIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const TrashIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;

export default function Dashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // STATE ใหม่: จัดการการเปิดไฟล์ในหน้าเดียว
  const [selectedFileId, setSelectedFileId] = useState(null);

  const navigate = useNavigate();

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/folders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) setFolders(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      let url = `/api/files?search=${searchTerm}`;
      if (activeFolderId) url += `&folder_id=${activeFolderId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); setDocuments([]); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, [activeFolderId, searchTerm]);

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName) return;
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ name: newFolderName })
      });
      if (res.ok) {
        setShowCreateFolderModal(false);
        setNewFolderName("");
        fetchFolders();
      }
    } catch (err) { alert("Failed to create folder"); }
  };

  const handleDeleteFile = async (e, fileId) => {
    e.stopPropagation();
    if (!window.confirm("Delete this file?")) return;
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) fetchFiles();
    } catch (err) { console.error(err); }
  };

  // ฟังก์ชันคลิกที่ไฟล์ -> เปิด Workspace แทนที่จะ Navigate เปลี่ยนหน้า
  const handleFileClick = (fileId) => {
    setSelectedFileId(fileId);
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div style={{ background: '#EFF6FF', padding: 8, borderRadius: 8 }}><FolderIcon /></div>
          SmartDoc AI
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="user-profile">
          <div className="avatar-circle">{user?.name?.charAt(0).toUpperCase()}</div>
          <span>{user?.name}</span>
        </div>
      </nav>

      <div className="main-layout">
        {/* Sidebar (อยู่ตลอด) */}
        <aside className="sidebar">
          <button className="btn-action primary" onClick={() => setShowUploadModal(true)}>
            <PlusIcon /> New File
          </button>
          <button className="btn-action" onClick={() => setShowCreateFolderModal(true)}>
            <FolderIcon /> New Folder
          </button>

          <div className="sidebar-menu-title">My Drive</div>
          <div className="folder-list">
            <div
              className={`folder-item ${!activeFolderId ? "active" : ""}`}
              onClick={() => setActiveFolderId(null)}
            >
              <FolderIcon /> <span>All Files</span>
            </div>
            {folders.map((f) => (
              <div
                key={f.id}
                className={`folder-item ${activeFolderId === f.id ? "active" : ""}`}
                onClick={() => setActiveFolderId(f.id)}
              >
                <FolderIcon /> <span>{f.name}</span>
              </div>
            ))}
          </div>

          <div className="sidebar-footer">
            <button className="btn-nav" onClick={() => navigate("/settings")}>
              <SettingsIcon /> Settings
            </button>
            <button className="btn-nav danger" onClick={onLogout}>
              <LogOutIcon /> Log Out
            </button>
          </div>
        </aside>

        {/* Main Content (สลับระหว่าง Table กับ Workspace) */}
        <main className="content" style={{ padding: selectedFileId ? 0 : 32 }}>

          {selectedFileId ? (
            // VIEW 2: Document Workspace (เปิดเต็มพื้นที่ Content)
            <DocumentWorkspace
              fileId={selectedFileId}
              onClose={() => setSelectedFileId(null)} // กดปิดแล้วกลับมาหน้า List
            />
          ) : (
            // VIEW 1: File List (หน้าปกติ)
            <>
              <div className="content-header">
                <h2>{activeFolderId ? folders.find(f => f.id === activeFolderId)?.name : "All Files"}</h2>
              </div>

              <div className="table-container">
                <table className="file-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>Name</th>
                      <th>Date Modified</th>
                      <th>Size</th>
                      <th>Tags</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" style={{ textAlign: "center" }}>Loading...</td></tr>
                    ) : documents.length > 0 ? (
                      documents.map((doc) => (
                        // คลิกที่แถวเพื่อเปิด Workspace
                        <tr key={doc.id} onClick={() => handleFileClick(doc.id)}>
                          <td>
                            <div className="file-info">
                              <FileIcon /> {doc.file_name}
                            </div>
                          </td>
                          <td className="file-meta">{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "-"}</td>
                          <td className="file-meta">{doc.file_size || "N/A"}</td>
                          <td>
                            {JSON.parse(doc.tags || "[]").map((tag, i) => (
                              <span key={i} className="tag tag-blue">#{tag}</span>
                            ))}
                          </td>
                          <td className="action-cell">
                            {/* ปุ่มลบไฟล์ */}
                            <button className="btn-icon" onClick={(e) => handleDeleteFile(e, doc.id)} title="Delete">
                              <TrashIcon />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" style={{ textAlign: "center", padding: 40, color: "#9CA3AF" }}>Empty Folder</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
      </div>

      {showUploadModal && (
        <SmartUploadModal onClose={() => setShowUploadModal(false)} onUploadSuccess={() => { setShowUploadModal(false); fetchFiles(); }} />
      )}

      {showCreateFolderModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>New Folder</h3>
            <form onSubmit={handleCreateFolder}>
              <input
                type="text"
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateFolderModal(false)}>Cancel</button>
                <button type="submit" className="btn-confirm">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}