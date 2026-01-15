'use client';

import { useState, useEffect } from 'react';

interface Budget {
  id: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      const res = await fetch('/api/budgets');
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.budgets);
      }
    } catch (error) {
      console.error('Load budgets error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
        }),
      });

      if (res.ok) {
        setFormData({
          amount: '',
          period: 'monthly',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
        setShowForm(false);
        loadBudgets();
      }
    } catch (error) {
      console.error('Create budget error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">💰</span>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
            Budgets
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Set spending limits and track your progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          {showForm ? 'Cancel' : '➕ Create Budget'}
        </button>
      </div>

      {showForm && (
        <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            New Budget
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="1000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Create Budget
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-2 p-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              No budgets yet. Create your first budget above.
            </p>
          </div>
        ) : (
          budgets.map((budget) => (
            <div
              key={budget.id}
              className="group p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-xl hover:scale-105"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold capitalize bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {budget.period} Budget
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {new Date(budget.startDate).toLocaleDateString()} -{' '}
                    {new Date(budget.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">${budget.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Spent: ${budget.spent.toFixed(2)}</span>
                  <span
                    className={budget.remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
                  >
                    Remaining: ${budget.remaining.toFixed(2)}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      budget.percentUsed > 100
                        ? 'bg-gradient-to-r from-red-600 to-rose-600'
                        : budget.percentUsed > 80
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    }`}
                    style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                  />
                </div>

                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">
                  {budget.percentUsed.toFixed(1)}% used
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
