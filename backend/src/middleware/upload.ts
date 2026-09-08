import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../config/constants';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `exam-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.docx', '.doc'];

  if (allowedExtensions.includes(ext) || ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะไฟล์เอกสาร .docx, .doc หรือ .pdf เท่านั้น'));
  }
};

export const uploadExamFile = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES, // 50MB
  },
  fileFilter,
});
