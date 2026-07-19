import express from "express";
import cors from "cors";
import { db } from "./db.js";
import { authenticate, generateToken, hashPassword, checkPassword } from "./auth.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", mode: "mock-db" });
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  
  const data = await db.readDb();
  if (data.users.find(u => u.email === email)) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const user = {
    id: Date.now().toString(),
    email,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString()
  };
  
  data.users.push(user);
  await db.writeDb(data);
  
  const token = generateToken(user);
  res.status(201).json({ token, user: { id: user.id, email: user.email } });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });
  
  const data = await db.readDb();
  const user = data.users.find(u => u.email === email);
  if (!user || !checkPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Progress Routes
app.get("/api/progress", authenticate, async (req, res) => {
  const data = await db.readDb();
  const userProgress = data.progress.filter(p => p.userId === req.user.id);
  res.json(userProgress);
});

app.post("/api/progress", authenticate, async (req, res) => {
  const { levelId, lessonId, completed } = req.body;
  if (!levelId || !lessonId) return res.status(400).json({ error: "levelId and lessonId required" });

  const data = await db.readDb();
  const existing = data.progress.find(p => p.userId === req.user.id && p.lessonId === lessonId);
  
  if (existing) {
    existing.completed = completed;
    existing.completedAt = new Date().toISOString();
  } else {
    data.progress.push({
      userId: req.user.id,
      levelId,
      lessonId,
      completed,
      completedAt: new Date().toISOString()
    });
  }
  
  await db.writeDb(data);
  res.json({ success: true });
});

// Start DB then server
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`SignBridge backend listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to initialize DB:", err);
});
