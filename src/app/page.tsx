import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">$</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                SpendSense
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                AI-Powered Financial Intelligence
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-slate-900 via-emerald-800 to-teal-700 dark:from-white dark:via-emerald-200 dark:to-teal-300 bg-clip-text text-transparent">
                Smart Money
              </span>
              <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Management
              </span>
            </h1>

            {/* Subheading */}
            <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-slate-600 dark:text-slate-400 leading-relaxed">
              Track spending, set budgets, achieve goals, and get personalized insights with AI-powered financial coaching.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                href="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-2xl hover:shadow-emerald-500/50 hover:scale-105"
              >
                Start Free Today
                <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-semibold text-lg border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            {/* Feature 1 */}
            <div className="group p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-xl hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Smart Analytics
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Visualize your spending patterns with beautiful charts and get actionable insights powered by AI.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                AI Assistant
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Chat with your personal financial advisor. Get budgeting tips, anomaly detection, and forecasts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-xl hover:scale-105">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Goal Tracking
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Set financial goals and track progress. Stay motivated with milestones and achievement insights.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 p-12 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                AI-Powered
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Smart Insights</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Unlimited
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Real-Time
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Analytics</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Secure
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Encrypted Data</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">$</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                SpendSense
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              © 2026 SpendSense. AI-powered budgeting made simple.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
