
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-brand-600" />
                        <h3 className="font-bold text-gray-900">Exam Countdown</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-4 space-y-4 flex-1">
                    {countdowns.sort((a, b) => a.date - b.date).map((item) => {
                        const days = calculateDaysRemaining(item.date);
                        const isOverdue = days < 0;

                        return (
                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-brand-300 transition-all shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center font-bold ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
                                        <span className="text-lg leading-none">{isOverdue ? '!' : days}</span>
                                        <span className="text-[10px] uppercase">Days</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                                {!item.isDefault && (
                                    <button
                                        onClick={() => removeCountdown(item.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        );
                    })}

                    {isAdding ? (
                        <form onSubmit={addCountdown} className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-fade-in-down space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Exam Name</label>
                                <input
                                    autoFocus
                                    required
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. My Mock Exam"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                <input
                                    required
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                                />
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button type="submit" className="flex-1 bg-brand-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-brand-700">Save</button>
                                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-200 text-gray-600 py-2 rounded-lg font-bold text-sm hover:bg-gray-300">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-brand-300 hover:text-brand-600 transition-all"
                        >
                            <Plus className="w-5 h-5" /> Add Custom Countdown
                        </button>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400 italic">
                    <AlertCircle className="w-4 h-4" />
                    <span>Dates are approximate. Check official portals for final schedules.</span>
                </div>
            </div>
        </div>
    );
};
