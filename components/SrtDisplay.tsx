import React, { useState } from 'react';

interface SrtDisplayProps {
  srtContent: string;
  onReset: () => void;
  fileName: string;
}

const SrtDisplay: React.FC<SrtDisplayProps> = ({ srtContent, onReset, fileName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(srtContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
    a.download = `${nameWithoutExtension || 'subtitles'}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-3xl bg-gray-800 rounded-lg p-6 space-y-4 shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-center text-white">產生的字幕</h2>
      <textarea
        readOnly
        value={srtContent}
        className="w-full h-96 p-4 bg-gray-900 text-gray-200 border border-gray-700 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label="Generated SRT content"
      />
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={handleCopy} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
          {copied ? '已複製！' : '複製到剪貼簿'}
        </button>
        <button onClick={handleDownload} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
          下載 .srt 檔案
        </button>
        <button onClick={onReset} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
          重新開始
        </button>
      </div>
    </div>
  );
};

export default SrtDisplay;