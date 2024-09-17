const Book = require('../models/Book'); 
const fs = require('fs');

exports.createBook = async (req, res, next) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    });

    await book.save();
    res.status(201).json({ message: 'Livre enregistré avec succès !' });
  } catch (error) {
    res.status(400).json({ error: 'Erreur lors de la création du livre', details: error.message });
  }
};

exports.modifyBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
      : { ...req.body };

    delete bookObject._userId;

    // Si nouvelle image, supprimer l'ancienne image
    if (req.file && book.imageUrl) {
      const oldImagePath = book.imageUrl.split('/images/')[1]; // Récupèrer le nom du fichier de l'ancienne image
      fs.unlink(`images/${oldImagePath}`, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression de l\'ancienne image:', err);
        }
      });
    }

    await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });

    res.status(200).json({ message: 'Livre modifié avec succès !' });

  } catch (error) {
    res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  }
};



exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    if (book.userId != req.auth.userId) {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, async (err) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
      }

      await Book.deleteOne({ _id: req.params.id });
      res.status(200).json({ message: 'Livre supprimé avec succès !' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression du livre', details: error.message });
  }
};

exports.getOneBook = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du livre', details: error.message });
  }
};

exports.getAllBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des livres', details: error.message });
  }
};

exports.getBestRatedBooks = async (req, res, next) => {
  try {
    const books = await Book.find();
    books.sort((a, b) => b.averageRating - a.averageRating);  // Trie par note moyenne décroissante
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des livres mieux notés', details: error.message });
  }
};

exports.rateBook = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const rating = parseInt(req.body.rating, 10);

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

    book.ratings.push({ userId, grade: rating });

    const totalRatings = book.ratings.reduce((sum, rate) => sum + rate.grade, 0);
    book.averageRating = totalRatings / book.ratings.length;

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la notation du livre', details: error.message });
  }
};


