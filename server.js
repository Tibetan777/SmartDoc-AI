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

// API อื่นๆ (Folder, File, Upload, Chat) คงเดิม...
// (ผมใส่ Code เต็มให้ไม่ได้เพราะยาวเกิน แต่คุณสามารถใช้ Logic เดิมที่มีอยู่แล้วได้เลยครับ
// สำคัญแค่ตรง Register/Login ต้องใช้ name_mem/email_mem ครับ)
// ...
// ...

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
