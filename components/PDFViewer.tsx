
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Maximize, Minimize, Download } from 'lucide-react';

interface PDFViewerProps {
    file: File;
    onBack: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ file, onBack }) => {
    const [fileUrl, setFileUrl] = useState<string>('');
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setFileUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            document.documentElement.requestFullscreen().catch(e => console.error(e));
        } else {
            document.exitFullscreen();
        }
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[600px] animate-fade-in max-w-5xl mx-auto space-y-6 pb-8">
            <button onClick={onBack} className="flex items-center text-sm font-bold text-gray-400 hover:text-brand-600 transition-colors group">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
            </button>

            {/* Main Viewer Card */}
            <div className="flex-1 flex flex-col bg-white border border-gray-100 rounded-[2.5rem] shadow-xl shadow-brand-900/5 overflow-hidden">
                {/* Toolbar */}
                <div className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-brand-600 rotate-3">
                             <Download className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-lg truncate max-w-[200px] md:max-w-md tracking-tight">
                                {file.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Digital Reader</span>
                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="text-[10px] text-brand-500 uppercase font-black tracking-widest">Enhanced</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.open(fileUrl, '_blank')}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-brand-600 hover:border-brand-500 transition-all flex items-center justify-center shadow-sm hidden sm:flex"
                            title="Download / Open in new tab"
                        >
                            <Download className="w-5 h-5" />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="w-10 h-10 rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-brand-600 hover:border-brand-500 transition-all flex items-center justify-center shadow-sm"
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Viewer Area */}
                <div className="flex-1 bg-surface-50 relative overflow-hidden">
                    {fileUrl ? (
                        <embed
                            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                            className="w-full h-full"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Loading PDF...
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-brand-50 border border-brand-100 rounded-3xl flex items-center gap-4 animate-fade-in-up">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                    <Maximize className="w-6 h-6" />
                </div>
                <p className="text-sm text-brand-800 font-medium leading-relaxed">
                    <span className="font-black uppercase text-[10px] tracking-widest block mb-1">Study Hack</span>
                    You can read your study materials here while using the <strong>AI Tutor</strong> (bottom right) to ask questions about specific sections of the text.
                </p>
            </div>
        </div>
    );
};
