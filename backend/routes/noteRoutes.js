const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Note = require('../models/Note');

// In-memory fallback for demo if MongoDB is not connected
let mockNotes = [
  { _id: '1', title: 'Welcome Note', content: 'This is a mock note because MongoDB is not connected.', folder: 'General', isArchived: false, isDeleted: false, createdAt: new Date() }
];

// Helper to check DB connection
const isDbConnected = () => mongoose.connection.readyState === 1;

// GET all notes
router.get('/', async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(mockNotes.filter(n => !n.isDeleted));
    }
    const notes = await Note.find({ isDeleted: false });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new note
router.post('/', async (req, res) => {
  if (!isDbConnected()) {
    const newNote = {
      _id: Date.now().toString(),
      title: req.body.title,
      content: req.body.content,
      folder: req.body.folder || 'General',
      isArchived: false,
      isDeleted: false,
      createdAt: new Date()
    };
    mockNotes.push(newNote);
    return res.status(201).json(newNote);
  }

  const note = new Note({
    title: req.body.title,
    content: req.body.content,
    folder: req.body.folder || 'General',
  });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE note
router.put('/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const index = mockNotes.findIndex(n => n._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Note not found' });
      
      if (req.body.title) mockNotes[index].title = req.body.title;
      if (req.body.content) mockNotes[index].content = req.body.content;
      if (req.body.folder) mockNotes[index].folder = req.body.folder;
      if (req.body.isArchived !== undefined) mockNotes[index].isArchived = req.body.isArchived;
      if (req.body.isDeleted !== undefined) mockNotes[index].isDeleted = req.body.isDeleted;
      
      return res.json(mockNotes[index]);
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (req.body.title) note.title = req.body.title;
    if (req.body.content) note.content = req.body.content;
    if (req.body.folder) note.folder = req.body.folder;
    if (req.body.isArchived !== undefined) note.isArchived = req.body.isArchived;
    if (req.body.isDeleted !== undefined) note.isDeleted = req.body.isDeleted;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Hard Delete
router.delete('/:id', async (req, res) => {
  try {
    if (!isDbConnected()) {
      const index = mockNotes.findIndex(n => n._id === req.params.id);
      if (index === -1) return res.status(404).json({ message: 'Note not found' });
      mockNotes.splice(index, 1);
      return res.json({ message: 'Note deleted permanently' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    await note.deleteOne();
    res.json({ message: 'Note deleted permanently' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

