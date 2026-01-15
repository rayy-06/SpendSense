'use client';

import { useState } from 'react';

interface UploadTransactionsProps {
  onSuccess: () => void;
}

export default function UploadTransactions({ onSuccess }: UploadTransactionsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/transactions/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        setUploading(false);
        return;
      }

      setSuccess(data.message);
      setFile(null);
      onSuccess();
    } catch (err) {
      setError('An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
      <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
        Upload Bank Statement
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        Upload a CSV or PDF file of your bank statement. Our AI will automatically parse and import
        your transactions.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium border border-emerald-200 dark:border-emerald-800">
            {success}
          </div>
        )}

        <div>
          <input
            type="file"
            accept=".csv,.pdf"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setError('');
              setSuccess('');
            }}
            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-300 file:font-semibold hover:file:bg-slate-200 dark:hover:file:bg-slate-600"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Accepts CSV and PDF files</p>
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {uploading ? 'Uploading and parsing...' : 'Upload and Import'}
        </button>
      </form>
    </div>
  );
}
