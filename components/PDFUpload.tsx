
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Upload Study Material</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {!selectedFile ? (
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                                dragActive ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
                            }`}
                        >
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleChange}
                                className="hidden"
                                id="pdf-upload"
                            />
                            <label htmlFor="pdf-upload" className="cursor-pointer">
                                <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <p className="text-gray-900 font-bold mb-1">Click to upload or drag & drop</p>
                                <p className="text-gray-500 text-sm">PDF (max. 10MB)</p>
                            </label>
                        </div>
                    ) : (
                        <div className="bg-brand-50 rounded-2xl p-6 border border-brand-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-white p-3 rounded-xl shadow-sm text-brand-600">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => onUpload(selectedFile)}
                                    className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-200"
                                >
                                    Continue to Viewer
                                </button>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 text-center text-xs text-gray-400">
                    Your files are processed locally and never stored on our servers.
                </div>
            </div>
        </div>
    );
};
