import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// คุณสามารถสร้างไฟล์ CSS ใหม่ชื่อ Dashboard.css หรือใช้ Home.css เดิมไปก่อนก็ได้
import "../home/Home.css";

// --- Icons Set (ปรับเพิ่ม Folder Icon) ---
const SearchIcon = () => (
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
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
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
const MoreVerticalIcon = () => (
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
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

export default function Dashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([
    "Home",
    "Legal",
    "Finance",
    "Education",
    "Projects",
  ]);
  const [activeFolder, setActiveFolder] = useState("Home");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Mock Data แทน API เดิมชั่วคราว เพื่อให้เห็นภาพ UI
  useEffect(() => {
    setLoading(true);
    // จำลองการ Fetch API /api/files
    setTimeout(() => {
      setDocuments([
        {
          id: 1,
          name: "Project_Proposal.pdf",
          type: "pdf",
          size: "2.4 MB",
          date: "2023-10-25",
          folder: "Projects",
        },
        {
          id: 2,
          name: "Invoice_001.jpg",
          type: "img",
          size: "1.2 MB",
          date: "2023-10-24",
          folder: "Finance",
        },
        {
          id: 3,
          name: "Lecture_Notes_Week1.docx",
          type: "doc",
          size: "500 KB",
          date: "2023-10-23",
          folder: "Education",
        },
        {
          id: 4,
          name: "Contract_Draft_v2.pdf",
          type: "pdf",
          size: "3.1 MB",
          date: "2023-10-22",
          folder: "Legal",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Logic ค้นหา (client-side filter หรือ call API ใหม่)
  };

  const filteredDocs = documents.filter(
    (doc) =>
      (activeFolder === "Home" || doc.folder === activeFolder) &&
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      className="dashboard-container"
      style={{
        display: "flex",
        height: "100vh",
        flexDirection: "column",
        backgroundColor: "#F3F6FC",
        color: "#333",
      }}
    >
      {/* 1. Top Navbar */}
      <nav
        className="navbar"
        style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e0e0e0",
          padding: "0 20px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1
            style={{
              color: "#1A73E8",
              fontSize: "20px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => setActiveFolder("Home")}
          >
            SmartDoc AI
          </h1>
        </div>

        <div style={{ flex: 1, maxWidth: "600px", margin: "0 20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f1f3f4",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
          >
            <SearchIcon />
            <input
              type="text"
              placeholder="Search in Drive..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                marginLeft: "10px",
                width: "100%",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "14px", fontWeight: 500 }}>
            {user?.name}
          </span>
          <button
            onClick={onLogout}
            style={{
              background: "none",
              border: "none",
              color: "#5f6368",
              cursor: "pointer",
            }}
          >
            Log Out
          </button>
        </div>
      </nav>

      <div
        className="main-body"
        style={{ display: "flex", flex: 1, overflow: "hidden" }}
      >
        {/* 2. Sidebar (Left Panel) */}
        <aside
          style={{
            width: "250px",
            backgroundColor: "white",
            borderRight: "1px solid #e0e0e0",
            padding: "20px 10px",
          }}
        >
          <button
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "24px",
              border: "none",
              backgroundColor: "white",
              boxShadow:
                "0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              marginBottom: "20px",
              color: "#3c4043",
            }}
          >
            <PlusIcon /> <span style={{ fontWeight: 500 }}>New</span>
          </button>

          <div className="folder-list">
            <div
              style={{
                padding: "0 12px 10px",
                fontSize: "12px",
                color: "#5f6368",
                fontWeight: 600,
              }}
            >
              FOLDERS
            </div>
            {folders.map((folder) => (
              <div
                key={folder}
                onClick={() => setActiveFolder(folder)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 20px",
                  borderRadius: "0 20px 20px 0",
                  cursor: "pointer",
                  backgroundColor:
                    activeFolder === folder ? "#e8f0fe" : "transparent",
                  color: activeFolder === folder ? "#1967d2" : "#3c4043",
                }}
              >
                <FolderIcon />
                <span style={{ fontSize: "14px" }}>{folder}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* 3. Main Content (Right Panel - File Table) */}
        <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <h2
            style={{ marginBottom: "20px", fontSize: "18px", fontWeight: 400 }}
          >
            {activeFolder}
          </h2>

          <div
            className="file-table"
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 50px",
                padding: "15px",
                borderBottom: "1px solid #e0e0e0",
                color: "#5f6368",
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              <span>Name</span>
              <span>Date Modified</span>
              <span>Size</span>
              <span></span>
            </div>

            {/* Loading State */}
            {loading && (
              <div style={{ padding: "20px", textAlign: "center" }}>
                Loading documents...
              </div>
            )}

            {/* File List */}
            {!loading &&
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/file/${doc.id}`)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 50px",
                    padding: "15px",
                    borderBottom: "1px solid #f1f3f4",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  className="file-row"
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      color: "#202124",
                      fontWeight: 500,
                    }}
                  >
                    <div style={{ color: "#5f6368" }}>
                      <FileIcon />
                    </div>
                    {doc.name}
                  </div>
                  <div style={{ color: "#5f6368", fontSize: "13px" }}>
                    {doc.date}
                  </div>
                  <div style={{ color: "#5f6368", fontSize: "13px" }}>
                    {doc.size}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert("File Options");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#5f6368",
                    }}
                  >
                    <MoreVerticalIcon />
                  </button>
                </div>
              ))}

            {!loading && filteredDocs.length === 0 && (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#5f6368",
                }}
              >
                No files in this folder
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
