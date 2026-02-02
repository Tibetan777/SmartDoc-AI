import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

export default function Settings({ user, onLogout }) {
    const navigate = useNavigate();
    const [passData, setPassData] = useState({ current: "", new: "", confirm: "" });
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) return alert("Passwords do not match");

        setLoading(true);
        // Simulate API Call
        setTimeout(() => {
            alert("Password updated successfully!");
            setPassData({ current: "", new: "", confirm: "" });
            setLoading(false);
        }, 1000);
    };

    const handleDeleteAccount = () => {
        const confirmed = window.confirm("WARNING: This will permanently delete your account and all files. Are you sure?");
        if (confirmed) {
            // Simulate API deletion
            alert("Account deletion scheduled. You will be logged out.");
            onLogout();
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button className="btn-back" onClick={() => navigate("/")}>←</button>
                <h1>Settings & Privacy</h1>
            </div>

            <div className="settings-grid">
                {/* Profile Card */}
                <div className="settings-card">
                    <h3 className="card-title">Profile Information</h3>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input className="form-input" type="text" value={user?.name} disabled />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input className="form-input" type="text" value={user?.role === 'admin' ? 'admin@smartdoc.com' : 'user@example.com'} disabled />
                    </div>
                </div>

                {/* Security Card */}
                <div className="settings-card">
                    <h3 className="card-title">Security</h3>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group">
                            <label>New Password</label>
                            <input className="form-input" type="password" required value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input className="form-input" type="password" required value={passData.confirm} onChange={e => setPassData({ ...passData, confirm: e.target.value })} />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>

                {/* Danger Zone */}
                <div className="settings-card danger-zone">
                    <h3 className="card-title danger-title">Danger Zone</h3>
                    <p style={{ marginBottom: 20, color: '#6B7280', fontSize: 14 }}>
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button onClick={handleDeleteAccount} className="btn-danger">Delete Account</button>
                </div>
            </div>
        </div>
    );
}