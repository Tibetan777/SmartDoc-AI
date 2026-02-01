import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import compression from "compression";
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
const SECRET = process.env.JWT_SECRET || "smartdoc-secret-key"; // ใส่ Default กันลืม

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
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

// Middleware Auth
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

// --- AUTH ROUTES (Epic 1) ---
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  // Validation
  if (!name || !email || !password)
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบ" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    // ใช้ชื่อคอลัมน์ให้ตรงกับ SQL (name_mem, email_mem)
    const [result] = await pool.query(
      "INSERT INTO members (name_mem, email_mem, password_encrypted, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, "user"],
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "อีเมลนี้ถูกใช้งานแล้ว หรือเกิดข้อผิดพลาด" });
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
      return res.status(401).json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
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

// --- FOLDER & FILES (Epic 2 & 3) ---
app.get("/api/folders", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM folders WHERE user_id = ? ORDER BY name ASC",
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/folders", auth, async (req, res) => {
  const { name } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO folders (name, user_id) VALUES (?, ?)",
      [name, req.user.id],
    );
    res.json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: "สร้างโฟลเดอร์ไม่สำเร็จ" });
  }
});

// Search & List Files (Epic 7)
app.get("/api/files", auth, async (req, res) => {
  try {
    const { folder_id, search } = req.query;
    let query = `SELECT d.*, mem.name_mem as uploader FROM documents d 
                 JOIN members mem ON d.user_id = mem.id_mem 
                 WHERE d.user_id = ?`;
    const params = [req.user.id];

    if (folder_id) {
      query += " AND d.folder_id = ?";
      params.push(folder_id);
    }
    if (search) {
      query += " AND (d.file_name LIKE ? OR d.tags LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    query += " ORDER BY d.created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload & AI Grouping (Epic 3 & 2)
app.post("/api/files/analyze", auth, (req, res) => {
  const { files } = req.body;
  // Mock AI Logic: แยกหมวดหมู่ตามชื่อไฟล์
  const suggestions = files.map((name) => {
    let folder = "General";
    const n = name.toLowerCase();
    if (n.includes("invoice") || n.includes("slip") || n.includes("money"))
      folder = "Finance";
    else if (n.includes("contract") || n.includes("legal") || n.includes("nda"))
      folder = "Legal";
    else if (n.includes("plan") || n.includes("slide") || n.includes("project"))
      folder = "Projects";
    return { fileName: name, suggestedFolder: folder };
  });
  res.json(suggestions);
});

app.post("/api/files/upload", auth, async (req, res) => {
  const { fileName, fileData, folderId, tags } = req.body;
  try {
    const extension = fileName.split(".").pop();
    const uniqueName = `${uuidv4()}.${extension}`;
    const base64Data = fileData.replace(/^data:.*?;base64,/, "");

    fs.writeFileSync(
      path.join("uploads", uniqueName),
      Buffer.from(base64Data, "base64"),
    );

    // Mock Summary (Epic 4) - สร้างสรุปอัตโนมัติเมื่ออัปโหลด
    const mockSummary = `เอกสารนี้คือ ${fileName} เป็นไฟล์ประเภท ${extension} ที่เกี่ยวข้องกับ ${tags?.[0] || "ทั่วไป"} สาระสำคัญคือการจัดการข้อมูลตามโครงสร้าง SmartDoc AI`;

    const [result] = await pool.query(
      `INSERT INTO documents (file_name, file_path, file_type, file_size, user_id, folder_id, tags, content_summary) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileName,
        uniqueName,
        extension,
        "N/A",
        req.user.id,
        folderId || null,
        JSON.stringify(tags || []),
        mockSummary,
      ],
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// --- DOCUMENT INTELLIGENCE (Epic 4 & 5) ---
app.get("/api/files/:id", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM documents WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (!rows[0]) return res.status(404).json({ error: "File not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Chat Endpoint (Epic 5)
app.post("/api/chat", auth, async (req, res) => {
  const { message, fileId } = req.body;
  // Mock AI Response
  // ในอนาคตเชื่อม OpenAI API ตรงนี้ 
  setTimeout(() => {
    res.json({
      role: "ai",
      text: `จากการวิเคราะห์ไฟล์ ID ${fileId}: คำถามของคุณที่ว่า "${message}" \nAI พบว่าเอกสารนี้มีเนื้อหาที่เกี่ยวข้องกับเรื่องดังกล่าวในหน้า 1 ย่อหน้าที่ 2 โดยระบุถึงความสำคัญของการจัดการเอกสาร (นี่คือการจำลองคำตอบ)`,
    });
  }, 1000); // Delay 1 วิ ให้ดูเหมือนคิด
});

app.listen(PORT, () =>
  console.log(`SmartDoc AI Server running on http://localhost:${PORT}`),
);
