import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings({ user, onLogout }) {
  const navigate = useNavigate();
  const [passData, setPassData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm)
      return alert("New passwords do not match");
    // ในระบบจริงต้องยิง API เปลี่ยนรหัสผ่านที่นี่
    alert("Password updated successfully (Mock)");
    setPassData({ current: "", new: "", confirm: "" });
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action is irreversible.",
      )
    ) {
      // ยิง API Delete Account ที่นี่
      onLogout();
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{
          marginBottom: "20px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#1A73E8",
        }}
      >
        ← Back to Dashboard
      </button>

      <h1 style={{ fontSize: "28px", marginBottom: "30px", color: "#202124" }}>
        Settings
      </h1>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>
          Profile Information
        </h2>
        <div style={{ marginBottom: "15px" }}>
          <label
            style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}
          >
            Full Name
          </label>
          <input
            type="text"
            value={user?.name}
            disabled
            style={{
              width: "100%",
              padding: "10px",
              background: "#f1f3f4",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div>
          <label
            style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}
          >
            Email
          </label>
          <input
            type="text"
            value={
              user?.role === "admin" ? "admin@smartdoc.com" : "user@example.com"
            }
            disabled
            style={{
              width: "100%",
              padding: "10px",
              background: "#f1f3f4",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ fontSize: "20px", marginBottom: "20px" }}>Security</h2>
        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              New Password
            </label>
            <input
              type="password"
              required
              value={passData.new}
              onChange={(e) =>
                setPassData({ ...passData, new: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={passData.confirm}
              onChange={(e) =>
                setPassData({ ...passData, confirm: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "#1A73E8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Update Password
          </button>
        </form>
      </div>

      <div
        style={{
          background: "#FEF7F7",
          padding: "30px",
          borderRadius: "8px",
          border: "1px solid #FADAD7",
        }}
      >
        <h2
          style={{ fontSize: "20px", marginBottom: "10px", color: "#D93025" }}
        >
          Danger Zone
        </h2>
        <p style={{ marginBottom: "20px", color: "#5F6368" }}>
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          style={{
            padding: "10px 20px",
            background: "white",
            color: "#D93025",
            border: "1px solid #D93025",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
