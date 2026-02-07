
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
      dueDate: Date.now() + 86400000 // Default to tomorrow
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
    <div className="animate-fade-in">
      <button onClick={onBack} className="mb-6 flex items-center text-gray-500 hover:text-brand-600">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
      </button>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Study Plan</h2>
          <p className="text-gray-500">Stay organized and track your progress offline.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-brand-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Task
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 p-6 bg-white border border-brand-200 rounded-2xl shadow-sm animate-fade-in-down">
          <form onSubmit={addTask} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Select Subject</label>
              <select
                required
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">-- Select from your library --</option>
                {availableBooks.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.subject} ({book.examType} {book.year})
                  </option>
                ))}
              </select>
              {availableBooks.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">Download some exam packs first!</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">What's your goal?</label>
              <input
                type="text"
                placeholder="e.g. Complete 50 questions"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-brand-600 text-white py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors"
              >
                Save Task
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No study tasks yet.</p>
          <p className="text-sm text-gray-400">Click "Add Task" to start your offline study journey.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.sort((a, b) => Number(a.completed) - Number(b.completed) || b.dueDate - a.dueDate).map((task) => (
            <div
              key={task.id}
              className={`flex items-center justify-between p-4 bg-white border rounded-xl transition-all ${
                task.completed ? 'opacity-60 border-gray-100 grayscale' : 'border-gray-200 hover:border-brand-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`p-1 rounded-full transition-colors ${
                    task.completed ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-brand-500'
                  }`}
                >
                  {task.completed ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                </button>
                <div>
                  <h4 className={`font-bold ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {task.description}
                  </h4>
                  <div className="flex items-center gap-3 text-xs font-medium mt-1">
                    <span className="flex items-center gap-1 text-brand-600">
                      <BookOpen className="w-3 h-3" /> {task.subject}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock className="w-3 h-3" /> {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
