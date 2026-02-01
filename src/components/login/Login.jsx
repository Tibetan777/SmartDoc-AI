import { useState } from "react";
import "./Login.css";

export default function Login({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegister ? "/api/register" : "/api/login";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        if (!isRegister) {
          localStorage.setItem("token", data.token);
          onLoginSuccess(data.user);
        } else {
          alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
          setIsRegister(false);
        }
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <h1>SmartDoc AI</h1>
        <p>{isRegister ? "สร้างบัญชีใหม่" : "ยินดีต้อนรับกลับมา"}</p>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="ชื่อเต็ม"
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          )}
          <input
            type="email"
            placeholder="อีเมล"
            required
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <input
            type="password"
            placeholder="รหัสผ่าน"
            required
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <button type="submit" className="btn-primary">
            {isRegister ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
          </button>
        </form>
        <button className="btn-flat" onClick={() => setIsRegister(!isRegister)}>
          {isRegister
            ? "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"
            : "ยังไม่มีบัญชี? สมัครสมาชิก"}
        </button>
      </div>
    </div>
  );
}
