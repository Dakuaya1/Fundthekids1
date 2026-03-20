'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface AiStep {
  agent: string;
  summary: string;
}

interface AiResponse {
  steps: AiStep[];
  result: string;
}

export default function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [showSteps, setShowSteps] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setSubmittedQuery(prompt.trim());

    try {
      const result = await api.post('/ai/query', { prompt });
      setResponse(result.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to query AI assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
        AI Assistant
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Ask for platform insights, funding gaps, verification risk, or sponsor activity.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={4}
          placeholder="Example: Which children need urgent funding right now?"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Analyzing...' : 'Run AI Query'}
        </button>
      </form>

      {error ? (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}

      {response ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              User Query
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {submittedQuery}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Agent Reasoning Steps
            </h3>
            <button
              type="button"
              onClick={() => setShowSteps((current) => !current)}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400"
            >
              {showSteps ? 'Hide reasoning steps' : 'Show reasoning steps'}
            </button>

            {showSteps ? (
              <div className="mt-3 space-y-2">
                {response.steps.map((step, index) => (
                  <div
                    key={`${step.agent}-${index}`}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {step.agent}
                    </p>
                    <p className="text-sm text-slate-800 dark:text-slate-200">
                      {step.summary}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Final Result
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {response.result}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
