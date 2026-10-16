import React, { useRef, useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { exportDataAsJSON, parseImportedJSON } from '../utils/storage';

export default function Navbar({ 
  subjects, 
  onAddSubject, 
  onAddExam, 
  theme, 
  onToggleTheme, 
  onImportData, 
  onResetData 
}) {
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const showNotification = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    const ok = exportDataAsJSON(subjects);
    if (ok) {
      showNotification('Backup downloaded successfully!');
    } else {
      showNotification('Failed to download backup.', 'error');
    }
    setShowDataMenu(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = parseImportedJSON(content);
        if (result.success) {
          onImportData(result.data);
          showNotification('Data imported successfully!');
        } else {
          showNotification(`Import failed: ${result.error}`, 'error');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
    setShowDataMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-zinc-900 dark:text-white">
                GradeTracker
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40">
                v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Minimal Academic Tracker & Exam Countdown
            </p>
          </div>
        </div>

        {/* Global Notification Pill */}
        {message && (
          <div className={`hidden md:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full animate-fade-in ${
            message.type === 'error'
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
          }`}>
            {message.type === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Data dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDataMenu(!showDataMenu)}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              title="Data Backup & Reset"
            >
              <Download className="w-4 h-4" />
            </button>

            {showDataMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowDataMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-1.5 z-50 text-xs">
                  <div className="px-2.5 py-1.5 font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                    Data Safety
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-left"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Export JSON Backup</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-left"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Import JSON Backup</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  <button
                    onClick={() => {
                      setShowDataMenu(false);
                      onResetData();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Demo Data</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-700" />
            )}
          </button>

          {/* New Subject Button */}
          <button
            onClick={onAddSubject}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Subject</span>
          </button>

          {/* Add Exam Primary Button */}
          <button
            onClick={onAddExam}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Exam</span>
          </button>

        </div>
      </div>
    </header>
  );
}
