import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

const PORT = 3000;
const app = express();
const uploadPath = path.join(__dirname, '../uploads');

app.use(express.json());
app.use(express.static(uploadPath));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const currentDate = new Date().toJSON().slice(0, 10);
    const filename = currentDate + '-' + Math.round(Math.random() * 1e9);
    cb(null, filename + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const MINE_TYPE_ALLOWED: string[] = ['image/png', 'image/jpg', 'image/jpeg'];
  if (MINE_TYPE_ALLOWED.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Error: File upload only supports the following filetypes - ' + MINE_TYPE_ALLOWED), false);
  }
};

const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

const MAX_FILES = 3;

const upload = multer({
  storage,
  limits,
  fileFilter
}).array('files', MAX_FILES);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Welcome to server upload static files' });
});

app.post('/upload', (req: Request, res: Response) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({
        code: err.code,
        message: err.message
      });
    }
    const files: any = req.files;
    const responseData = files.map((file: any) => {
      const relativePath = path.relative(uploadPath, file.path);
      return {
        originalname: file.originalname,
        filename: file.filename,
        path: relativePath
      };
    });
    res.status(200).json(responseData);
  });
});

app.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}`);
});
