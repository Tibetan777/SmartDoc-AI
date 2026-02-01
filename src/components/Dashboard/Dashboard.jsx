import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SmartUploadModal from "./SmartUploadModal"; // Import Modal
import "./Dashboard.css";

// --- Icons ---
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
const PlusIcon = () => (
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
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default function Dashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false); // State ควบคุม Modal
  const navigate = useNavigate();

  // Load Folders
  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/folders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFolders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load Files
  const fetchFiles = async (folderId = null, search = "") => {
    setLoading(true);
    try {
      let url = `/api/files?search=${search}`;
      if (folderId) url += `&folder_id=${folderId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setDocuments([]);
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

  // ฟังก์ชันช่วยแกะ Tags ไม่ให้พัง
  const parseTags = (tagData) => {
    try {
      return typeof tagData === "string" ? JSON.parse(tagData) : tagData || [];
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
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
          <button onClick={onLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <button className="btn-new" onClick={() => setShowUploadModal(true)}>
            <PlusIcon /> New
          </button>

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

        {/* File Table */}
        <main className="content">
          <div className="table-container">
            <table className="file-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th>AI Tags</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <tr
                      key={doc.id}
                      onClick={() => navigate(`/file/${doc.id}`)}
                    >
                      <td>
                        <div className="file-name-cell">
                          <FileIcon /> {doc.file_name}
                        </div>
                      </td>
                      <td>
                        {doc.created_at
                          ? new Date(doc.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>{doc.file_size || "N/A"}</td>
                      <td>
                        <div className="tags-cell">
                          {parseTags(doc.tags).map((tag, i) => (
                            <span key={i} className="tag-badge">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No files found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Render Modal */}
      {showUploadModal && (
        <SmartUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={() => {
            setShowUploadModal(false);
            fetchFiles(activeFolderId, searchTerm); // Refresh ข้อมูลหลังอัปโหลด
          }}
        />
      )}
    </div>
  );
}
