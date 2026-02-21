
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
        <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] animate-fade-in">
            {/* Toolbar */}
            <div className="bg-white border border-gray-200 rounded-t-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm md:text-base truncate max-w-[200px] md:max-w-md">
                            {file.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">PDF Document</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(fileUrl, '_blank')}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors hidden sm:block"
                        title="Download / Open in new tab"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Viewer Area */}
            <div className="flex-1 bg-gray-100 border-x border-b border-gray-200 rounded-b-2xl overflow-hidden relative">
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

            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Maximize className="w-4 h-4" />
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>Tip:</strong> You can read your study materials here while using the <strong>AI Tutor</strong> (bottom right) to ask questions about specific sections of the text.
                </p>
            </div>
        </div>
    );
};
