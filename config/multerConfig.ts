import path from "path";
import multer from "multer";
import { randomInt } from "crypto";

const paths = path.join(__dirname, "../src/uploads");

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, paths);
  },
  filename: function (_req, file, cb) {
    let mime = file.mimetype.split("/")[1];
    switch (mime) {
      case "svg+xml": {
        mime = "svg";
        break;
      }
      default:
        mime = file.mimetype.split("/")[1];
    }
    cb(null, `${Date.now()}_${randomInt(1, 256)}.${mime}`); //datenow is used to prevent overriding of file
  },
});
export const upload = multer({ storage });
