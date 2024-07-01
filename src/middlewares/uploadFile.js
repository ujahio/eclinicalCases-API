const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    const fileName = path.parse(file.originalname).name;
    const fileExtension = path.parse(file.originalname).ext;
    cb(null, `${fileName}${fileExtension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
});

module.exports = upload;
