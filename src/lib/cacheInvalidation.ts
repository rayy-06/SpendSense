import { queryCache } from './queryCache';

/**
 * Cache Invalidation Helpers
 *
 * Call these functions after mutations to ensure cache consistency
 */

export function invalidateTransactionCache(userId: string) {
  queryCache.invalidate(userId, 'transactions');
  queryCache.invalidate(userId, 'spending_patterns');
  queryCache.invalidate(userId, 'summary');
  queryCache.invalidate(userId, 'budgets'); // Budgets depend on transactions
}

export function invalidateBudgetCache(userId: string) {
  queryCache.invalidate(userId, 'budgets');
}

export function invalidateGoalCache(userId: string) {
  queryCache.invalidate(userId, 'goals');
}

export function invalidateAllCache(userId: string) {
  queryCache.invalidate(userId);
}
