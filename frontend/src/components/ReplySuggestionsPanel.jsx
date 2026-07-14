import React from 'react';

export default function ReplySuggestionsPanel({ 
  suggestions = [], 
  onSuggestionClick, 
  isLoading = false,
  isVisible = true 
}) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-3 dark:border-slate-700 dark:from-slate-800 dark:to-slate-800/60">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {isLoading ? 'Generating suggestions...' : 'Quick replies'}
        </span>
      </div>

      {isLoading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-24 animate-pulse rounded-full bg-slate-300 dark:bg-slate-600"
            />
          ))}
        </div>
      ) : suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="group inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition duration-200 hover:bg-blue-100 hover:text-blue-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-blue-600/40 dark:hover:text-blue-300"
              title={suggestion}
            >
              <span className="text-base opacity-0 transition group-hover:opacity-100">→</span>
              <span className="truncate max-w-[150px]">{suggestion}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          No suggestions available
        </div>
      )}
    </div>
  );
}
