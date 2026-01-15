'use client';

import { useState, useEffect } from 'react';
import UploadTransactions from '@/components/UploadTransactions';

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string | null;
  date: string;
  type: string;
  category: Category | null;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    categoryId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transRes, catRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories'),
      ]);

      if (transRes.ok) {
        const data = await transRes.json();
        setTransactions(data.transactions);
      }

      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId || null,
        }),
      });

      if (res.ok) {
        setFormData({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          categoryId: '',
        });
        setShowForm(false);
        loadData();
      }
    } catch (error) {
      console.error('Create transaction error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Delete transaction error:', error);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">💳</span>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
            Transactions
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage your income and expenses
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setShowUpload(!showUpload);
              setShowForm(false);
            }}
            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            {showUpload ? 'Cancel Upload' : '📄 Upload File'}
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setShowUpload(false);
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            {showForm ? 'Cancel' : '➕ Add Transaction'}
          </button>
        </div>
      </div>

      {showUpload && <UploadTransactions onSuccess={loadData} />}

      {showForm && (
        <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            New Transaction
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value, categoryId: '' })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                >
                  <option value="">Uncategorized</option>
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="Optional description"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Add Transaction
            </button>
          </form>
        </div>
      )}

      <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            All Transactions
          </h2>
        </div>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-3">
                No transactions yet. Add your first transaction above.
              </p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="group p-5 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex justify-between items-center"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${
                    transaction.type === 'income'
                      ? 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30'
                      : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30'
                  }`}>
                    <span className="text-xl">
                      {transaction.type === 'income' ? '💵' : '💳'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {transaction.description || 'No description'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {transaction.category?.name || 'Uncategorized'} •{' '}
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p
                    className={`font-bold text-lg ${
                      transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:text-white dark:hover:bg-red-500 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
