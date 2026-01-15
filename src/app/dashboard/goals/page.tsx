'use client';

import { useState, useEffect } from 'react';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
  });
  const [progressInputs, setProgressInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals);
      }
    } catch (error) {
      console.error('Load goals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0,
          deadline: formData.deadline || null,
        }),
      });

      if (res.ok) {
        setFormData({
          name: '',
          targetAmount: '',
          currentAmount: '',
          deadline: '',
        });
        setShowForm(false);
        loadGoals();
      }
    } catch (error) {
      console.error('Create goal error:', error);
    }
  };

  const updateProgress = async (goalId: string, newAmount: string) => {
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentAmount: amount }),
      });

      if (res.ok) {
        setProgressInputs({ ...progressInputs, [goalId]: '' });
        loadGoals();
      }
    } catch (error) {
      console.error('Update goal error:', error);
    }
  };

  const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, goalId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = progressInputs[goalId];
      if (input && input.trim() !== '') {
        updateProgress(goalId, input);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🎯</span>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Loading goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
            Financial Goals
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Set targets and track your savings progress
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
        >
          {showForm ? 'Cancel' : '➕ Create Goal'}
        </button>
      </div>

      {showForm && (
        <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            New Goal
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Goal Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Emergency Fund"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="5000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Current Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.currentAmount}
                  onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Deadline (optional)</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Create Goal
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-2 p-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              No goals yet. Create your first financial goal above.
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <div
                key={goal.id}
                className="group p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl hover:scale-105"
              >
                <div className="mb-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {goal.name}
                  </h3>
                  {goal.deadline && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-700 dark:text-slate-300">
                      Progress: ${goal.currentAmount.toFixed(2)}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Target: ${goal.targetAmount.toFixed(2)}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>

                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 text-center">
                    {progress.toFixed(1)}% complete
                  </p>
                </div>

                <div className="mt-6 flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Enter amount"
                    value={progressInputs[goal.id] || ''}
                    onChange={(e) => setProgressInputs({ ...progressInputs, [goal.id]: e.target.value })}
                    onKeyDown={(e) => handleProgressKeyDown(e, goal.id)}
                    className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  />
                  <button
                    onClick={() => {
                      const input = progressInputs[goal.id];
                      if (input && input.trim() !== '') {
                        updateProgress(goal.id, input);
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Update
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
