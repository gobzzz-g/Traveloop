'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit3, BookOpen, Smile } from 'lucide-react';
import { noteService } from '@/services/index';
import { tripService } from '@/services/tripService';
import { Note, NoteMood } from '@/types';
import { formatDate } from '@/lib/utils';
import DashboardLayout from '../dashboard/layout';

const MOODS: { value: NoteMood; emoji: string; label: string }[] = [
  { value: 'HAPPY', emoji: '😊', label: 'Happy' },
  { value: 'EXCITED', emoji: '🤩', label: 'Excited' },
  { value: 'ADVENTUROUS', emoji: '🌟', label: 'Adventurous' },
  { value: 'RELAXED', emoji: '😌', label: 'Relaxed' },
  { value: 'NEUTRAL', emoji: '😐', label: 'Neutral' },
  { value: 'TIRED', emoji: '😴', label: 'Tired' },
  { value: 'OTHER', emoji: '🤔', label: 'Other' },
];

export default function JournalPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [form, setForm] = useState({ title: '', content: '', mood: 'HAPPY' as NoteMood, tripId: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => noteService.getNotes(),
  });

  const { data: tripsData } = useQuery({
    queryKey: ['trips', 'journal'],
    queryFn: () => tripService.getTrips({ limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: () => noteService.createNote({ ...form, tripId: form.tripId || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setShowCreate(false);
      setForm({ title: '', content: '', mood: 'HAPPY', tripId: '' });
      toast.success('Note saved! 📝');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (note: Note) => noteService.updateNote(note.id, { title: form.title, content: form.content, mood: form.mood }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setEditNote(null);
      toast.success('Note updated!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    },
  });

  const notes: Note[] = data?.data || [];

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-brand-400" /> Travel Journal
            </h1>
            <p className="text-surface-400 mt-1">Capture memories and reflections from your journeys.</p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 text-white font-medium hover:bg-brand-600 transition-all btn-glow"
          >
            <Plus className="w-4 h-4" /> New Entry
          </button>
        </div>

        {/* Create / Edit Form */}
        {(showCreate || editNote) && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
            <h2 className="font-semibold text-white mb-4">{editNote ? 'Edit Note' : 'New Journal Entry'}</h2>
            <div className="space-y-4">
              <input
                placeholder="Title (optional)"
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="input-field"
              />
              <textarea
                placeholder="What happened today? What did you see, feel, discover? ✍️"
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                rows={5}
                className="input-field resize-none"
              />
              <div className="flex flex-wrap gap-2">
                <span className="text-surface-400 text-sm flex items-center gap-1"><Smile className="w-4 h-4" /> Mood:</span>
                {MOODS.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, mood: m.value }))}
                    className={`px-3 py-1.5 rounded-xl text-sm transition-all ${form.mood === m.value ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300' : 'glass border border-surface-700 text-surface-400'}`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
              {!editNote && tripsData?.data && (
                <select value={form.tripId} onChange={e => setForm(p => ({ ...p, tripId: e.target.value }))} className="input-field">
                  <option value="">No trip association</option>
                  {tripsData.data.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              )}
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowCreate(false); setEditNote(null); }} className="px-4 py-2 text-surface-400 hover:text-white text-sm">Cancel</button>
                <button
                  onClick={() => {
                    if (!form.content.trim()) { toast.error('Write something!'); return; }
                    editNote ? updateMutation.mutate(editNote) : createMutation.mutate();
                  }}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-2 rounded-xl bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-all disabled:opacity-50"
                >
                  {editNote ? 'Save Changes' : 'Save Entry'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notes List */}
        {isLoading ? (
          [...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl mb-4" />)
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📓</div>
            <h3 className="text-xl font-semibold text-white mb-2">Your journal is empty</h3>
            <p className="text-surface-400">Start writing about your adventures!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note, i) => {
              const mood = MOODS.find(m => m.value === note.mood);
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mood?.emoji}</span>
                        {note.title && <h3 className="font-semibold text-white">{note.title}</h3>}
                      </div>
                      <p className="text-surface-500 text-xs mt-0.5">
                        {formatDate(note.date, 'MMMM d, yyyy')}
                        {note.trip && <span> · {note.trip.title}</span>}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setForm({ title: note.title || '', content: note.content, mood: note.mood, tripId: '' });
                          setEditNote(note);
                          setShowCreate(false);
                        }}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this entry?')) deleteMutation.mutate(note.id); }}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-surface-300 text-sm leading-relaxed line-clamp-3">{note.content}</p>
                  {note.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3">
                      {note.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-surface-700 text-surface-400 text-xs">#{t}</span>)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
