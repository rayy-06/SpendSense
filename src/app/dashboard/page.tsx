import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { SpendingChart } from '@/components/SpendingChart';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  // Get user stats
  const [totalTransactions, totalIncome, totalExpenses, recentTransactions, expensesByCategory] = await Promise.all([
    prisma.transaction.count({ where: { userId: session.userId } }),
    prisma.transaction.aggregate({
      where: { userId: session.userId, type: 'income' },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId: session.userId, type: 'expense' },
      _sum: { amount: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.userId },
      orderBy: { date: 'desc' },
      take: 5,
      include: { category: true },
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId: session.userId, type: 'expense' },
      _sum: { amount: true },
    }),
  ]);

  const income = totalIncome._sum.amount || 0;
  const expenses = totalExpenses._sum.amount || 0;
  const balance = income - expenses;

  // Get category names for chart
  const categoryData = await Promise.all(
    expensesByCategory.map(async (item) => {
      const category = item.categoryId
        ? await prisma.category.findUnique({ where: { id: item.categoryId } })
        : null;
      return {
        name: category?.name || 'Uncategorized',
        value: Number(item._sum.amount || 0),
      };
    })
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
          Dashboard
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Welcome back! Here&apos;s your financial overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-xl hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Balance</p>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">💰</span>
            </div>
          </div>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent' : 'text-red-600 dark:text-red-400'}`}>
            ${balance.toFixed(2)}
          </p>
        </div>
        <div className="group p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-xl hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Income</p>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">📈</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${income.toFixed(2)}</p>
        </div>
        <div className="group p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 transition-all hover:shadow-xl hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Expenses</p>
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">📉</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-transparent">${expenses.toFixed(2)}</p>
        </div>
        <div className="group p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Transactions</p>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white text-xl">🧾</span>
            </div>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{totalTransactions}</p>
        </div>
      </div>

      {/* Spending Chart */}
      {categoryData.length > 0 && (
        <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Spending by Category
          </h2>
          <SpendingChart data={categoryData} />
        </div>
      )}

      {/* Recent Transactions */}
      <div className="p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Recent Transactions
          </h2>
          <Link
            href="/dashboard/transactions"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors group"
          >
            View all <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <div className="space-y-3">
          {recentTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📊</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-3 text-lg">No transactions yet.</p>
              <Link
                href="/dashboard/transactions"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Add your first transaction →
              </Link>
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="group p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all hover:shadow-md border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${
                    transaction.type === 'income'
                      ? 'bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30'
                      : 'bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30'
                  }`}>
                    <span className="text-xl">
                      {transaction.type === 'income' ? '💵' : '💳'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {transaction.description || 'No description'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {transaction.category?.name || 'Uncategorized'} •{' '}
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-bold text-lg ${
                    transaction.type === 'income'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/dashboard/transactions"
          className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">➕</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Add Transaction</h3>
            <p className="text-sm text-blue-100">Track your income and expenses</p>
          </div>
        </Link>
        <Link
          href="/dashboard/transactions?upload=true"
          className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Upload Statement</h3>
            <p className="text-sm text-emerald-100">Import from CSV or PDF</p>
          </div>
        </Link>
        <Link
          href="/dashboard/ai-assistant"
          className="group relative overflow-hidden p-6 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="font-bold text-lg mb-2">AI Assistant</h3>
            <p className="text-sm text-purple-100">Get personalized insights</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
