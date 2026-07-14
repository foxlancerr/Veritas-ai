import React, { useState, useEffect } from 'react';
import apiHelpers from '../../api/apiHelper';

export default function ConversationSummaryModal({ isOpen, onClose, conversationId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await apiHelpers.post(
        `/chat/conversations/${conversationId}/summarize`,
        {},
        { withCredentials: true }
      );

      if (response.success && response.summary) {
        setSummary(response.summary);
      } else {
        setError('Failed to generate summary');
      }
    } catch (err) {
      setError(err.message || 'Error generating summary');
      console.error('Summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;

    const text = formatSummaryText(summary);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSummaryText = (summary) => {
    let text = '';

    if (summary.summary) {
      text += `Summary:\n${summary.summary}\n\n`;
    }

    if (summary.topics && summary.topics.length > 0) {
      text += `Topics:\n${summary.topics.map((t) => `• ${t}`).join('\n')}\n\n`;
    }

    if (summary.decisions && summary.decisions.length > 0) {
      text += `Decisions:\n${summary.decisions.map((d) => `• ${d}`).join('\n')}\n\n`;
    }

    if (summary.actionItems && summary.actionItems.length > 0) {
      text += `Action Items:\n${summary.actionItems.map((a) => `• ${a}`).join('\n')}\n\n`;
    }

    if (summary.pendingQuestions && summary.pendingQuestions.length > 0) {
      text += `Pending Questions:\n${summary.pendingQuestions.map((q) => `• ${q}`).join('\n')}`;
    }

    return text;
  };

  useEffect(() => {
    if (isOpen && !summary) {
      fetchSummary();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-2xl dark:bg-slate-800">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Conversation Summary</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700"></div>
              <p className="text-slate-600 dark:text-slate-400">Generating summary...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          ) : summary ? (
            <div className="space-y-6">
              {/* Summary */}
              {summary.summary && (
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Summary</h3>
                  <p className="text-slate-700 dark:text-slate-300">{summary.summary}</p>
                </div>
              )}

              {/* Topics */}
              {summary.topics && summary.topics.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Topics</h3>
                  <ul className="list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
                    {summary.topics.map((topic, idx) => (
                      <li key={idx}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Decisions */}
              {summary.decisions && summary.decisions.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Decisions</h3>
                  <ul className="list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
                    {summary.decisions.map((decision, idx) => (
                      <li key={idx}>{decision}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {summary.actionItems && summary.actionItems.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Action Items</h3>
                  <ul className="list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
                    {summary.actionItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pending Questions */}
              {summary.pendingQuestions && summary.pendingQuestions.length > 0 && (
                <div>
                  <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Pending Questions</h3>
                  <ul className="list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
                    {summary.pendingQuestions.map((question, idx) => (
                      <li key={idx}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900">
          <button
            onClick={handleCopy}
            disabled={!summary || loading}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
          >
            {copied ? '✓ Copied' : 'Copy Summary'}
          </button>
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {loading ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
