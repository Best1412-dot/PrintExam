import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './database/schema';
import { seedDatabase } from './database/seeder';
import { initWebSocketServer } from './services/wsService';
import { auditMiddleware } from './middleware/audit';

// Import Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import examRoutes from './routes/examRoutes';
import avRoutes from './routes/avRoutes';
import deliveryRoutes from './routes/deliveryRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import auditRoutes from './routes/auditRoutes';
import notificationRoutes from './routes/notificationRoutes';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create sample mock files if not present for instant preview
const mockDocx = path.join(uploadDir, 'mock-exam-cpe101.docx');
if (!fs.existsSync(mockDocx)) {
  fs.writeFileSync(mockDocx, 'MOCK EXAM DOCUMENT CPE101');
}

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Request Audit Middleware for mutations (REQ-0013)
app.use('/api', auditMiddleware);

// API Routes Mapping
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/exam-schedules', scheduleRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/exams', avRoutes);
app.use('/api/exams', deliveryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error Handler]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'เกิดข้อผิดพลาดภายในระบบแม่ข่าย (Internal Server Error)',
  });
});

// Start WebSocket Server
initWebSocketServer(server);

// Initialize DB and launch server
async function startServer() {
  try {
    await initializeDatabase();
    await seedDatabase();

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 PrintExam Backend API Server running on port ${PORT}`);
      console.log(`📡 WebSocket endpoint ready at ws://localhost:${PORT}/ws`);
      console.log(`📁 File uploads served from ${uploadDir}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
