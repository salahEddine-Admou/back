import multer from "multer";

// Configuration de l'emplacement de stockage et du nom de fichier
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Le répertoire où les fichiers seront stockés
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

// Filtre pour n'accepter que certains types de fichiers
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images and videos are allowed!'), false);
  }
};

// Initialisation de l'upload multer
const upload = multer({ storage: storage, fileFilter: fileFilter });

export default upload;
