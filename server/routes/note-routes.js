import express from 'express';
import Note from '../models/note-model';

const router = express.Router();

router
  .route('/')
  .get((req, res) => {
    Note.find({}, (err, notes) => {
      res.json(notes);
    });
  }) // get
  .post((req, res) => {
    let note = new Note(req.body);
    note.save();
    res.status(201).send(note);
  }); // post

export default router;