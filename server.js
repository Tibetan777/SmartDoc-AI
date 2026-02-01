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
const SECRET = process.env.JWT_SECRET;

// Initial Setup
if (!SECRET) {
  console.error("FATAL: JWT_SECRET missing");
  process.exit(1);
}
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: "50mb" })); // เพิ่ม Limit สำหรับไฟล์ใหญ่
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

// --- AUTH ROUTES ---
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

// --- FOLDER ROUTES ---
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
  const { name, parent_id } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO folders (name, user_id, parent_id) VALUES (?, ?, ?)",
      [name, req.user.id, parent_id || null],
    );
    res.json({ id: result.insertId, name });
  } catch (err) {
    res.status(500).json({ error: "Cannot create folder" });
  }
});

// --- DOCUMENT ROUTES ---
app.get("/api/files", auth, async (req, res) => {
  try {
    const { folder_id, search } = req.query;
    let query = `SELECT d.*, mem.name_mem as uploader 
                 FROM documents d 
                 JOIN members mem ON d.user_id = mem.id_mem 
                 WHERE d.user_id = ?`;
    const params = [req.user.id];

    if (folder_id) {
      query += " AND d.folder_id = ?";
      params.push(folder_id);
    }
    if (search) {
      query += " AND d.file_name LIKE ?";
      params.push(`%${search}%`);
    }

    query += " ORDER BY d.created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Smart Upload & AI Analyze
app.post("/api/files/upload", auth, async (req, res) => {
  const { fileName, fileData, folderId, tags } = req.body; // fileData is base64
  try {
    const extension = fileName.split(".").pop();
    const uniqueName = `${uuidv4()}.${extension}`;

    // Save binary file
    const base64Data = fileData.replace(/^data:.*?;base64,/, "");
    fs.writeFileSync(
      path.join("uploads", uniqueName),
      Buffer.from(base64Data, "base64"),
    );

    const [result] = await pool.query(
      `INSERT INTO documents (file_name, file_path, file_type, file_size, user_id, folder_id, tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        fileName,
        uniqueName,
        extension,
        "N/A",
        req.user.id,
        folderId || null,
        JSON.stringify(tags || []),
      ],
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

// Mock AI Analyze Endpoint (สำหรับการจัดกลุ่มก่อนบันทึก)
app.post("/api/files/analyze", auth, (req, res) => {
  const { files } = req.body; // รับ array ของชื่อไฟล์
  const suggestions = files.map((name) => {
    let folder = "General";
    if (
      name.toLowerCase().includes("invoice") ||
      name.toLowerCase().includes("slip")
    )
      folder = "Finance";
    if (
      name.toLowerCase().includes("legal") ||
      name.toLowerCase().includes("contract")
    )
      folder = "Legal";
    if (
      name.toLowerCase().includes("slide") ||
      name.toLowerCase().includes("lecture")
    )
      folder = "Education";
    return { fileName: name, suggestedFolder: folder };
  });
  res.json(suggestions);
});

app.delete("/api/files/:id", auth, async (req, res) => {
  try {
    const [file] = await pool.query(
      "SELECT file_path FROM documents WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    if (!file[0]) return res.status(404).json({ error: "File not found" });

    // Delete Physical File
    const fullPath = path.join("uploads", file[0].file_path);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await pool.query("DELETE FROM documents WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

// GET Document Details for Workspace
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

app.listen(PORT, () =>
  console.log(`SmartDoc AI Server running on http://localhost:${PORT}`),
);
