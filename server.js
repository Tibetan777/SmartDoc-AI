import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "smartdoc-secret";

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50,
});

// Middleware
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ error: "Invalid Token" });
  }
};

app.post("/api/files/upload", auth, async (req, res) => {
  const { fileName, fileData, folderId, tags } = req.body;
  try {
    const extension = fileName.split(".").pop();
    const uniqueName = `${uuidv4()}.${extension}`;
    const base64Data = fileData.replace(/^data:.*?;base64,/, "");

    fs.writeFileSync(path.join("uploads", uniqueName), Buffer.from(base64Data, "base64"));

    // Smart Mock Summary Generator
    let mockSummary = "";
    const lowerName = fileName.toLowerCase();

    if (lowerName.includes("invoice") || lowerName.includes("slip") || tags.includes("Finance")) {
      mockSummary = "เอกสารทางการเงิน: ระบุยอดรวมการชำระเงิน วันที่ทำรายการ และรายละเอียดคู่ค้า/ผู้รับบริการ ตรวจพบยอดเงินสำคัญและกำหนดการชำระ";
    } else if (lowerName.includes("contract") || lowerName.includes("legal") || tags.includes("Legal")) {
      mockSummary = "เอกสารทางกฎหมาย/สัญญา: ครอบคลุมข้อตกลง เงื่อนไขการให้บริการ ระยะเวลาสัญญา และบทลงโทษหากผิดสัญญา";
    } else if (lowerName.includes("report") || lowerName.includes("slide")) {
      mockSummary = "รายงานสรุปผลการดำเนินงาน: นำเสนอข้อมูลสถิติ กราฟแสดงแนวโน้ม และข้อเสนอแนะเชิงกลยุทธ์สำหรับผู้บริหาร";
    } else {
      mockSummary = `เอกสารทั่วไป (${extension}): ประกอบด้วยข้อมูล Text และรูปภาพที่เกี่ยวข้องกับหัวข้อ "${fileName}" เหมาะสำหรับการอ้างอิงข้อมูลพื้นฐาน`;
    }

    const [result] = await pool.query(
      `INSERT INTO documents (file_name, file_path, file_type, file_size, user_id, folder_id, tags, content_summary) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fileName, uniqueName, extension, "N/A", req.user.id, folderId || null, JSON.stringify(tags || []), mockSummary]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// --- แก้ไขจุดตาย: Register ---
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    // ใช้ name_mem และ email_mem ให้ตรงกับ SQL
    const [result] = await pool.query(
      "INSERT INTO members (name_mem, email_mem, password_encrypted, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, "user"],
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err); // ดู Error ใน Terminal
    res.status(400).json({ error: "Email already exists or error occurred" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query(
      "SELECT * FROM members WHERE email_mem = ?",
      [email],
    );
    const user = users[0];
    if (
      !user ||
      !(await bcrypt.compare(password, user.password_encrypted || ""))
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id_mem, role: user.role }, SECRET, {
      expiresIn: "24h",
    });
    res.json({
      token,
      user: { id: user.id_mem, name: user.name_mem, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});
app.delete("/api/files/:id", auth, async (req, res) => {
  try {
    // ตรวจสอบว่าเป็นเจ้าของไฟล์ไหม
    const [file] = await pool.query("SELECT file_path FROM documents WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    if (!file[0]) return res.status(404).json({ error: "File not found or unauthorized" });

    // ลบไฟล์จริง (ถ้ามี)
    const filePath = path.join("uploads", file[0].file_path);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // ลบจาก DB
    await pool.query("DELETE FROM documents WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// API อื่นๆ (Folder, File, Upload, Chat) คงเดิม...
// (ผมใส่ Code เต็มให้ไม่ได้เพราะยาวเกิน แต่คุณสามารถใช้ Logic เดิมที่มีอยู่แล้วได้เลยครับ
// สำคัญแค่ตรง Register/Login ต้องใช้ name_mem/email_mem ครับ)
// ...
// ...

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
