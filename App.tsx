import React, { useState, useCallback, useMemo } from 'react';
import { generateSrtFromAudio } from './services/geminiService';
import SrtDisplay from './components/SrtDisplay';
import Loader from './components/Loader';

// Define language options in Traditional Chinese
const languageOptions = [
  { value: 'Traditional Chinese', label: '繁體中文' },
  { value: 'English', label: '英文' },
  { value: 'Spanish', label: '西班牙文' },
  { value: 'French', label: '法文' },
  { value: 'German', label: '德文' },
  { value: 'Japanese', label: '日文' },
  { value: 'Korean', label: '韓文' },
  { value: 'Russian', label: '俄文' },
  { value: 'Arabic', label: '阿拉伯文' },
  { value: 'Hindi', label: '印地文' },
];

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [srtContent, setSrtContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<string>('Traditional Chinese');

  const audioUrl = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type.startsWith('audio/') || selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('請選擇一個有效的音訊或影片檔案。');
        setFile(null);
      }
    }
  };
  
  const handleGenerateClick = useCallback(async () => {
    if (!file) {
      setError('請先選擇一個檔案。');
      return;
    }

    setIsLoading(true);
    setError('');
    setSrtContent('');

    try {
      const result = await generateSrtFromAudio(file, language);
      if (result.startsWith('An error occurred:')) {
         setError(result);
         setSrtContent('');
      } else {
         setSrtContent(result);
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '發生未知錯誤。';
      setError(`產生字幕失敗: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [file, language]);

  const handleReset = () => {
    setFile(null);
    setSrtContent('');
    setError('');
    setIsLoading(false);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const renderInitialState = () => (
    <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white">上傳您的音訊/影片檔案</h2>
        <p className="mt-2 text-gray-400">在幾秒鐘內產生專業的 SRT 字幕。</p>
      </div>

      <div>
        <label htmlFor="language-select" className="block mb-2 text-sm font-medium text-gray-300">字幕語言</label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          {languageOptions.map((lang) => (
            <option key={lang.value} value={lang.value}>{lang.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-center w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">點擊上傳</span> 或拖放檔案</p>
            <p className="text-xs text-gray-500">音訊或影片檔案</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="audio/*,video/*" />
        </label>
      </div>

      {file && (
        <div className="bg-gray-700 p-4 rounded-lg text-center">
          <p className="font-semibold text-white">已選擇檔案：{file.name}</p>
          {audioUrl && <audio controls src={audioUrl} className="w-full mt-4" />}
        </div>
      )}

      {error && <p className="text-red-400 text-center">{error}</p>}

      <button
        onClick={handleGenerateClick}
        disabled={!file || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg shadow-lg transform hover:scale-105"
      >
        產生字幕
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <header className="text-center mb-10">
        <h1 className="text-5xl font-bold tracking-tight">
          AI <span className="text-blue-400">字幕</span> 產生器
        </h1>
        <p className="text-lg text-gray-400 mt-2">由 Google Gemini 驅動</p>
      </header>
      <main className="w-full flex items-center justify-center">
        {isLoading ? <Loader /> : srtContent ? <SrtDisplay srtContent={srtContent} onReset={handleReset} fileName={file?.name || 'subtitles.srt'} /> : renderInitialState()}
      </main>
    </div>
  );
};

export default App;