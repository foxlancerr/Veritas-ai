import multer from "multer";
import path from "path";
import crypto from "crypto";

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public"); // better than public
  },

  filename: (req, file, cb) => {
    // generate unique name
    const uniqueName = crypto.randomUUID();

    // keep original extension
    const ext = path.extname(file.originalname);

    cb(null, `${uniqueName}${ext}`);
  },
});

const upload = multer({ storage });

export default upload;