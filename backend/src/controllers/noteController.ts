import { Request, Response } from 'express';
import Note from '../models/Note';

export const getAllNotes = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    // Find all notes for this user, sort by newest updatedAt/createdAt first
    const notes = await Note.find({ userId }).sort({ updatedAt: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching all notes' });
  }
};

export const getNoteByDate = async (req: Request, res: Response) => {
  try {
    const { date } = req.params;
    const userId = (req as any).user._id;

    // Return the most recent note for this date
    const note = await Note.findOne({ userId, dateStr: date }).sort({ createdAt: -1 });
    if (!note) {
      return res.status(200).json({ success: true, data: { content: '' } });
    }
    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching note' });
  }
};

export const saveNote = async (req: Request, res: Response) => {
  try {
    const { title, content, noteId } = req.body;
    const userId = (req as any).user._id;

    const today = new Date();
    const defaultDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const dateStr = req.params.date || req.body.dateStr || defaultDateStr;

    // Compute title from first line of content if title is empty
    const firstLine = content ? content.trim().split('\n')[0].replace(/^[#*-\s]+/, '') : '';
    const computedTitle = title || (firstLine ? firstLine.substring(0, 40) : 'Untitled Note');

    let note;
    if (noteId) {
      note = await Note.findOneAndUpdate(
        { _id: noteId, userId },
        { title: computedTitle, content, dateStr },
        { new: true }
      );
    } else {
      note = await Note.findOneAndUpdate(
        { userId, dateStr },
        { title: computedTitle, content, dateStr },
        { new: true, upsert: true }
      );
    }

    res.status(200).json({ success: true, data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error saving note' });
  }
};


export const deleteNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const note = await Note.findOneAndDelete({ _id: id, userId });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.status(200).json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting note' });
  }
};
