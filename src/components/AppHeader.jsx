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
  AlertCircle,
} from 'lucide-react';
import { VIEWS } from '../constants/views';
import { ACTIVE_TERM, exportDataAsJSON, parseImportedJSON } from '../utils/storage';

/**
 * Fixed 56px Swiss telemetry header: brand mark, breadcrumb
 * (EXAM TRACKER / Fall 2024 / Semester 1), 4-tab route switcher,
 * quick actions (data tools, theme, + New Exam) and profile avatar.
 */
export default function AppHeader({
  subjects = [],
  activeView,
  onViewChange,
  onAddSubject,
  onAddExam,
  theme,
  onToggleTheme,
  onImportData,
  onResetData,
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
    e.target.value = '';
    setShowDataMenu(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 dark:bg-night-canvas/95 backdrop-blur-sm border-b border-outline-variant dark:border-night-border transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        {/* Brand + breadcrumb */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span
            className="w-6 h-6 rounded bg-on-surface dark:bg-night-ink text-white dark:text-night-canvas flex items-center justify-center"
            aria-hidden="true"
          >
            <GraduationCap className="w-4 h-4" />
          </span>
          <nav
            aria-label="Breadcrumb"
            className="hidden sm:flex items-center gap-1.5 font-label-caps text-label-caps uppercase"
          >
            <span className="font-semibold text-on-surface dark:text-night-ink">Exam Tracker</span>
            <span className="text-outline-variant dark:text-night-border" aria-hidden="true">
              /
            </span>
            <span className="text-on-surface-variant dark:text-night-muted">{ACTIVE_TERM}</span>
            <span className="text-outline-variant dark:text-night-border" aria-hidden="true">
              /
            </span>
            <span className="text-on-surface-variant dark:text-night-muted">Semester 1</span>
          </nav>
        </div>

        {/* 4-tab route switcher */}
        <nav
          aria-label="Primary"
          className="flex-1 h-14 flex items-stretch justify-start lg:justify-center gap-0.5 overflow-x-auto"
        >
          {VIEWS.map((view) => {
            const isActive = activeView === view.id;
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => onViewChange(view.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-2.5 sm:px-3 flex items-center gap-1.5 whitespace-nowrap font-label-caps text-label-caps uppercase transition-colors ${
                  isActive
                    ? 'text-on-surface dark:text-night-ink'
                    : 'text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {view.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 bottom-0 h-0.5 bg-on-surface dark:bg-night-ink"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Import/Export feedback pill */}
          {message && (
            <div
              role="status"
              className={`hidden md:flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded border font-label-caps uppercase ${
                message.type === 'error'
                  ? 'text-error border-error/40 bg-error/5'
                  : 'text-secondary border-secondary/40 bg-secondary/5'
              }`}
            >
              {message.type === 'error' ? (
                <AlertCircle className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Data tools */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDataMenu(!showDataMenu)}
              className="p-2 rounded text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink hover:bg-surface-container-low dark:hover:bg-night-surface transition"
              title="Data Backup & Reset"
              aria-label="Data Backup and Reset"
              aria-expanded={showDataMenu}
              aria-haspopup="true"
            >
              <Download className="w-4 h-4" />
            </button>

            {showDataMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDataMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest dark:bg-night-surface rounded border border-outline-variant dark:border-night-border p-1 z-50 text-xs shadow-none">
                  <div className="px-2.5 py-1.5 font-label-caps text-label-caps uppercase text-on-surface-variant dark:text-night-muted">
                    Data Safety
                  </div>
                  <button
                    onClick={handleExport}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink hover:bg-surface-container-low dark:hover:bg-night-canvas transition text-left"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export JSON Backup</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink hover:bg-surface-container-low dark:hover:bg-night-canvas transition text-left"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON Backup</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                  />
                  <div className="my-1 border-t border-outline-variant dark:border-night-border" />
                  <button
                    onClick={() => {
                      setShowDataMenu(false);
                      onResetData();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded text-error hover:bg-error/5 transition text-left"
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
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded text-on-surface-variant dark:text-night-muted hover:text-on-surface dark:hover:text-night-ink hover:bg-surface-container-low dark:hover:bg-night-surface transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* New Subject (secondary) */}
          <button
            type="button"
            onClick={onAddSubject}
            className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-semibold text-on-surface-variant dark:text-night-muted border border-outline-variant dark:border-night-border hover:text-on-surface dark:hover:text-night-ink transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Subject</span>
          </button>

          {/* + New Exam (primary) */}
          <button
            type="button"
            onClick={() => onAddExam()}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-semibold text-white bg-on-surface dark:bg-night-ink dark:text-night-canvas hover:opacity-90 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Exam</span>
          </button>

          {/* Profile avatar */}
          <span
            className="hidden sm:flex w-7 h-7 rounded-full border border-outline-variant dark:border-night-border items-center justify-center font-label-caps text-[10px] font-semibold text-on-surface-variant dark:text-night-muted select-none"
            title="Scholar profile"
            aria-label="Scholar profile"
          >
            GT
          </span>
        </div>
      </div>
    </header>
  );
}
