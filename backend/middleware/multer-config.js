const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({ storage: storage });

const resizeImage = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const inputPath = req.file.path;
  const outputPath = `images/resized_${req.file.filename}`;
  
  sharp(inputPath)
    .resize(260, 206, {
      fit: sharp.fit.cover,
      position: sharp.strategy.entropy // (Choisit l'endroit le plus interessant de l'image, basé sur l'entropie (quantité de détails).)
    })
    .toFile(outputPath)
    .then(() => {
      fs.unlink(inputPath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression du fichier original:', err);
        }
        // Renomme le fichier temporaire en nom d'origine
        fs.rename(outputPath, inputPath, (err) => {
          if (err) {
            console.error('Erreur lors du renommage du fichier redimensionné:', err);
            return res.status(500).json({ error: 'Erreur de traitement de l\'image.' });
          }
          next();
        });
      });
    })
    .catch(error => {
      console.error('Erreur de redimensionnement:', error);
      res.status(500).json({ error: 'Erreur de redimensionnement de l\'image.' });
    });
};

module.exports = { upload, resizeImage };
