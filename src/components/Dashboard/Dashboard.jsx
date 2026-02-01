import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // แนะนำให้สร้างไฟล์ CSS แยกเพื่อจัดการตาราง

// --- Icons (คงเดิมจากที่คุณมี แต่เน้น Folder และ File) ---
const FolderIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
  </svg>
);
const FileIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
    <polyline points="13 2 13 9 20 9"></polyline>
  </svg>
);

export default function Dashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. โหลดรายการโฟลเดอร์
  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/folders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      console.error("Fetch folders error:", err);
    }
  };

  // 2. โหลดรายการไฟล์ (กรองตามโฟลเดอร์ที่เลือก)
  const fetchFiles = async (folderId = null, search = "") => {
    setLoading(true);
    try {
      let url = `/api/files?search=${search}`;
      if (folderId) url += `&folder_id=${folderId}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error("Fetch files error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchFiles(activeFolderId, searchTerm);
  }, [activeFolderId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFiles(activeFolderId, searchTerm);
  };

  return (
    <div className="dashboard-container">
      {/* Top Navbar (คงเดิมจากโค้ดเดิมของคุณ) */}
      <nav className="navbar">
        <div className="navbar-brand">SmartDoc AI</div>
        <form onSubmit={handleSearch} className="search-box">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
        <div className="user-profile">
          <span>{user?.name}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>

      <div className="main-layout">
        {/* Sidebar: แสดงรายการโฟลเดอร์ */}
        <aside className="sidebar">
          <button className="btn-new">New +</button>
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
        </aside>

        {/* Content: ตารางรายการไฟล์ */}
        <main className="content">
          <table className="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Date Modified</th>
                <th>Size</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">Loading...</td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} onClick={() => navigate(`/file/${doc.id}`)}>
                    <td>
                      <FileIcon /> {doc.file_name}
                    </td>
                    <td>{new Date(doc.created_at).toLocaleDateString()}</td>
                    <td>{doc.file_size || "N/A"}</td>
                    <td>
                      {JSON.parse(doc.tags || "[]").map((tag) => (
                        <span key={tag} className="tag-badge">
                          {tag}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}
