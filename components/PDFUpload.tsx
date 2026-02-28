
import React, { useState } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';

interface PDFUploadProps {
    onUpload: (file: File) => void;
    onClose: () => void;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({ onUpload, onClose }) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === "application/pdf") {
                setSelectedFile(file);
            } else {
                alert("Please upload a PDF file.");
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <div className="fixed inset-0 bg-brand-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in border border-white/20">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Upload Material</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10">
                    {!selectedFile ? (
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-4 border-dashed rounded-[2rem] p-12 text-center transition-all duration-300 ${
                                dragActive ? 'border-brand-500 bg-brand-50 scale-[0.98]' : 'border-gray-100 hover:border-brand-200 hover:bg-gray-50'
                            }`}
                        >
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleChange}
                                className="hidden"
                                id="pdf-upload"
                            />
                            <label htmlFor="pdf-upload" className="cursor-pointer group">
                                <div className="bg-brand-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-brand-200 group-hover:scale-110 transition-transform">
                                    <Upload className="w-10 h-10" />
                                </div>
                                <p className="text-xl font-extrabold text-gray-900 mb-2">Drop your PDF here</p>
                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">or click to browse files</p>
                            </label>
                        </div>
                    ) : (
                        <div className="bg-brand-50 rounded-[2rem] p-8 border-2 border-brand-100 animate-fade-in-up">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="bg-white p-5 rounded-2xl shadow-lg text-brand-600 rotate-3">
                                    <FileText className="w-10 h-10" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-gray-900 text-lg truncate">{selectedFile.name}</p>
                                    <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => onUpload(selectedFile)}
                                    className="flex-1 bg-brand-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20"
                                >
                                    Start Studying
                                </button>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="px-8 py-4 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-50 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Privacy: Your files stay on this device and are never uploaded to a server.
                    </p>
                </div>
            </div>
        </div>
    );
};
