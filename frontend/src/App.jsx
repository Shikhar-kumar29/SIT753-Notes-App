import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Folder, Archive, Trash2, 
  ChevronRight, MoreVertical, Layout, Grid, List as ListIcon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api/notes';

function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('General');
  const [activeNote, setActiveNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', folder: 'General' });

  // Load notes
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(API_BASE);
      setNotes(res.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const createNote = async () => {
    if (!newNote.title || !newNote.content) return;
    try {
      const res = await axios.post(API_BASE, { ...newNote, folder: selectedFolder });
      setNotes([...notes, res.data]);
      setNewNote({ title: '', content: '', folder: 'General' });
      setIsEditing(false);
    } catch (err) {
      console.error('Error creating note:', err);
    }
  };

  const updateNoteStatus = async (id, updates) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}`, updates);
      setNotes(notes.map(n => n._id === id ? res.data : n));
    } catch (err) {
      console.error('Error updating note:', err);
    }
  };

  const filteredNotes = notes.filter(n => 
    !n.isDeleted && 
    n.folder === selectedFolder &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || 
     n.content.toLowerCase().includes(search.toLowerCase()))
  );

  const folders = ['General', 'Work', 'Personal', 'Ideas'];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layout className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SIT753 Notes</h1>
        </div>

        <nav className="space-y-1">
          {folders.map(f => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                selectedFolder === f ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Folder className="w-4 h-4" />
                <span className="text-sm font-medium">{f}</span>
              </div>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full">
                {notes.filter(n => n.folder === f && !n.isDeleted).length}
              </span>
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-slate-800 rounded-lg text-sm">
              <Archive className="w-4 h-4" />
              <span>Archive</span>
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-slate-800 rounded-lg text-sm">
              <Trash2 className="w-4 h-4" />
              <span>Trash</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search your notes..."
              className="w-full bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">{selectedFolder}</h2>
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button className="p-1.5 rounded-md bg-slate-800 text-slate-100 shadow-sm"><Grid className="w-4 h-4"/></button>
                <button className="p-1.5 rounded-md text-slate-500 hover:text-slate-300"><ListIcon className="w-4 h-4"/></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredNotes.map(note => (
                  <motion.div
                    key={note._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-slate-100 truncate pr-6">{note.title}</h3>
                      <button className="text-slate-500 hover:text-slate-300"><MoreVertical className="w-4 h-4"/></button>
                    </div>
                    <p className="text-slate-400 text-sm line-clamp-3 mb-4 leading-relaxed">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => updateNoteStatus(note._id, { isDeleted: true })}
                          className="p-1.5 hover:bg-red-500/10 hover:text-red-400 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty State */}
              {filteredNotes.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
                    <Folder className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-slate-300 font-medium mb-1">No notes found</h3>
                  <p className="text-slate-500 text-sm">Start by creating a new note in this folder.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* New Note Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Note Title"
                  className="w-full bg-transparent text-xl font-bold mb-4 focus:outline-none placeholder:text-slate-700"
                  value={newNote.title}
                  onChange={e => setNewNote({...newNote, title: e.target.value})}
                />
                <textarea 
                  placeholder="Start typing your thoughts..."
                  className="w-full bg-transparent h-64 resize-none focus:outline-none text-slate-300 leading-relaxed placeholder:text-slate-700"
                  value={newNote.content}
                  onChange={e => setNewNote({...newNote, content: e.target.value})}
                />
              </div>
              <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
                <select 
                  className="bg-slate-800 border-none rounded-lg text-xs font-medium px-3 py-1.5 focus:ring-0"
                  value={newNote.folder}
                  onChange={e => setNewNote({...newNote, folder: e.target.value})}
                >
                  {folders.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={createNote}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
