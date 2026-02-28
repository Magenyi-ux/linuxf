
import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, X, Clock, AlertCircle } from 'lucide-react';
import { Countdown } from '../types';

interface CountdownMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

const DEFAULT_COUNTDOWNS: Countdown[] = [
    { id: 'jamb-2026', name: 'JAMB 2026', date: new Date('2026-04-19').getTime(), isDefault: true },
    { id: 'waec-2026', name: 'WAEC 2026', date: new Date('2026-05-05').getTime(), isDefault: true },
    { id: 'neco-2026', name: 'NECO 2026', date: new Date('2026-06-01').getTime(), isDefault: true },
];

export const CountdownMenu: React.FC<CountdownMenuProps> = ({ isOpen, onClose }) => {
    const [countdowns, setCountdowns] = useState<Countdown[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDate, setNewDate] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('waExamPrep_countdowns');
        if (saved) {
            setCountdowns(JSON.parse(saved));
        } else {
            setCountdowns(DEFAULT_COUNTDOWNS);
        }
    }, []);

    const saveCountdowns = (newItems: Countdown[]) => {
        setCountdowns(newItems);
        localStorage.setItem('waExamPrep_countdowns', JSON.stringify(newItems));
    };

    const addCountdown = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newDate) return;

        const newItem: Countdown = {
            id: Date.now().toString(),
            name: newName,
            date: new Date(newDate).getTime(),
            isDefault: false
        };

        saveCountdowns([...countdowns, newItem]);
        setNewName('');
        setNewDate('');
        setIsAdding(false);
    };

    const removeCountdown = (id: string) => {
        saveCountdowns(countdowns.filter(c => c.id !== id));
    };

    const calculateDaysRemaining = (targetDate: number) => {
        const diff = targetDate - Date.now();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in border border-white/20">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-600 rotate-3">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Exam Dates</h3>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Stay on schedule</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="overflow-y-auto p-8 space-y-6 flex-1 sidebar-scrollbar bg-surface-50/30">
                    {countdowns.sort((a, b) => a.date - b.date).map((item) => {
                        const days = calculateDaysRemaining(item.date);
                        const isOverdue = days < 0;

                        return (
                            <div key={item.id} className="group flex items-center justify-between p-6 bg-white border border-gray-100 rounded-3xl hover:border-brand-500 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center gap-6">
                                    <div className={`w-16 h-16 rounded-[1.25rem] flex flex-col items-center justify-center font-black shadow-inner transition-all group-hover:scale-110 ${isOverdue ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-brand-50 text-brand-600 border border-brand-100'}`}>
                                        <span className="text-2xl leading-none mb-0.5">{isOverdue ? '!' : days}</span>
                                        <span className="text-[8px] uppercase tracking-[0.2em] font-black">{isOverdue ? 'LATE' : 'DAYS'}</span>
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900 text-lg tracking-tight">{item.name}</div>
                                        <div className="text-[10px] font-black text-gray-400 flex items-center gap-1.5 mt-1 uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                {!item.isDefault && (
                                    <button
                                        onClick={() => removeCountdown(item.id)}
                                        className="w-10 h-10 rounded-xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center shadow-sm"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {isAdding ? (
                        <form onSubmit={addCountdown} className="p-8 bg-white rounded-[2rem] border-2 border-brand-100 animate-fade-in-up space-y-6 shadow-xl shadow-brand-500/5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Exam Label</label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. My Mock Exam"
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-brand-500 transition-all font-bold text-gray-700 shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Date</label>
                                <input
                                    required
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:border-brand-500 transition-all font-bold text-gray-700 shadow-inner"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="submit" className="flex-1 bg-brand-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all">Save Event</button>
                                <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 bg-gray-100 text-gray-400 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="group w-full py-6 border-4 border-dashed border-gray-100 rounded-3xl text-gray-300 font-black uppercase tracking-widest text-xs flex flex-col items-center justify-center gap-3 hover:border-brand-200 hover:text-brand-500 hover:bg-gray-50 transition-all duration-300"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-all shadow-inner">
                                <Plus className="w-6 h-6" />
                            </div>
                            New Custom Date
                        </button>
                    )}
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-50 flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4 text-brand-300 shrink-0" />
                    <span>Dates are approximate. Always verify with official sources.</span>
                </div>
            </div>
        </div>
    );
};
