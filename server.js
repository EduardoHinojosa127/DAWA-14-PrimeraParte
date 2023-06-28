const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const fileExtension = path.extname(file.originalname);
  if (fileExtension === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos en formato PDF.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Tamaño máximo del archivo: 10 MB
  },
}).array('files', 10); // Permitir carga de múltiples archivos

app.use(express.static(__dirname));

app.post('/upload', (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Error de Multer
      res.status(400).send(err.message);
    } else if (err) {
      // Otro tipo de error
      res.status(400).send(err.message);
    } else {
      // Los archivos se cargaron correctamente
      const fileInfos = req.files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      }));
      res.json(fileInfos);
    }
  });
});

app.use((err, req, res, next) => {
  res.status(400).send(err.message);
});

app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
