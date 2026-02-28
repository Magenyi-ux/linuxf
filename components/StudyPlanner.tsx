
import React, { useState, useEffect } from 'react';
import { StudyPlanTask, Subject, ExamType, Book } from '../types';
import { Calendar, CheckCircle2, Circle, Plus, Trash2, BookOpen, Clock, ArrowLeft } from 'lucide-react';

interface StudyPlannerProps {
  onBack: () => void;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({ onBack }) => {
  const [tasks, setTasks] = useState<StudyPlanTask[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);

  // Form states
  const [selectedBookId, setSelectedBookId] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  useEffect(() => {
    // Load tasks
    const savedTasks = localStorage.getItem('waExamPrep_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    // Load available books for dropdown
    const savedBooks = localStorage.getItem('waExamPrep_books');
    if (savedBooks) {
      setAvailableBooks(Object.values(JSON.parse(savedBooks)));
    }
  }, []);

  const saveTasks = (newTasks: StudyPlanTask[]) => {
    setTasks(newTasks);
    localStorage.setItem('waExamPrep_tasks', JSON.stringify(newTasks));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const book = availableBooks.find(b => b.id === selectedBookId);
    if (!book) return;

    const newTask: StudyPlanTask = {
      id: Date.now().toString(),
      subject: book.subject,
      examType: book.examType,
      description: description || `Review ${book.subject} (${book.year})`,
      completed: false,
      dueDate: new Date(dueDate).getTime()
    };

    saveTasks([...tasks, newTask]);
    setIsAdding(false);
    setDescription('');
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      <button onClick={onBack} className="flex items-center text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors group">
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Study Plan</h2>
          <p className="text-gray-500 font-medium">Organize your preparation and track your daily goals.</p>
        </div>
        {!isAdding && (
            <button
                onClick={() => setIsAdding(true)}
                className="bg-brand-600 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-brand-700 transition-all flex items-center gap-3 shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98]"
            >
                <Plus className="w-5 h-5" /> New Task
            </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-xl shadow-brand-900/5 animate-fade-in-up relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full translate-x-32 -translate-y-32" />

          <form onSubmit={addTask} className="space-y-8 relative z-10">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Subject Area</label>
              <select
                required
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all font-bold text-gray-700 shadow-inner"
              >
                <option value="">-- Select from your library --</option>
                {availableBooks.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.subject} ({book.examType} {book.year})
                  </option>
                ))}
              </select>
              {availableBooks.length === 0 && (
                <p className="text-xs font-bold text-amber-600 mt-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Download some exam packs first!
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Task Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Complete 50 questions"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all font-bold text-gray-700 shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block ml-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-brand-500 focus:bg-white transition-all font-bold text-gray-700 shadow-inner"
                  />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-brand-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-700 shadow-xl shadow-brand-500/20 transition-all"
              >
                Add to My Plan
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-10 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="bg-gray-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Calendar className="w-10 h-10 text-gray-200" />
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">Your plan is empty</p>
          <p className="text-gray-500 font-medium max-w-xs mx-auto">Start adding tasks to stay on top of your exam preparation.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.sort((a, b) => Number(a.completed) - Number(b.completed) || b.dueDate - a.dueDate).map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-8 bg-white border rounded-[2rem] transition-all duration-300 group ${
                task.completed ? 'opacity-50 border-transparent bg-gray-50' : 'border-gray-100 hover:border-brand-500 hover:shadow-xl shadow-brand-900/5'
              }`}
            >
              <div className="flex items-center gap-8">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`transition-all duration-500 transform ${
                    task.completed ? 'text-emerald-500' : 'text-gray-200 hover:text-brand-500 group-hover:scale-110'
                  }`}
                >
                  {task.completed ? <CheckCircle2 className="w-10 h-10" /> : <Circle className="w-10 h-10" />}
                </button>
                <div>
                  <h4 className={`text-xl font-bold tracking-tight ${task.completed ? 'line-through text-gray-400 font-medium' : 'text-gray-900'}`}>
                    {task.description}
                  </h4>
                  <div className="flex items-center gap-6 text-xs font-black uppercase tracking-widest mt-3">
                    <span className="flex items-center gap-2 text-brand-600">
                      <BookOpen className="w-4 h-4" /> {task.subject}
                    </span>
                    <span className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" /> {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
