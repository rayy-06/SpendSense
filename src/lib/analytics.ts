import { prisma } from './prisma';

export interface AnomalyDetectionResult {
  anomalies: Array<{
    transactionId: string;
    amount: number;
    description: string | null;
    date: Date;
    category: string | null;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export async function detectAnomalies(userId: string): Promise<AnomalyDetectionResult> {
  // Get last 90 days of transactions
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: ninetyDaysAgo },
    },
    include: { category: true },
    orderBy: { date: 'desc' },
  });

  // Calculate statistics by category
  const categoryStats = new Map<string, { amounts: number[]; mean: number; stdDev: number }>();

  transactions.forEach((t) => {
    if (t.type !== 'expense') return;

    const key = t.categoryId || 'uncategorized';
    if (!categoryStats.has(key)) {
      categoryStats.set(key, { amounts: [], mean: 0, stdDev: 0 });
    }
    categoryStats.get(key)!.amounts.push(t.amount);
  });

  // Calculate mean and standard deviation for each category
  categoryStats.forEach((stats) => {
    const n = stats.amounts.length;
    if (n === 0) return;

    stats.mean = stats.amounts.reduce((sum, a) => sum + a, 0) / n;
    const variance = stats.amounts.reduce((sum, a) => sum + Math.pow(a - stats.mean, 2), 0) / n;
    stats.stdDev = Math.sqrt(variance);
  });

  // Detect anomalies (transactions > 2 standard deviations from mean)
  const anomalies: AnomalyDetectionResult['anomalies'] = [];

  transactions.forEach((t) => {
    if (t.type !== 'expense') return;

    const key = t.categoryId || 'uncategorized';
    const stats = categoryStats.get(key);

    if (!stats || stats.amounts.length < 3) return; // Need at least 3 transactions

    const zScore = (t.amount - stats.mean) / stats.stdDev;

    if (Math.abs(zScore) > 2) {
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (Math.abs(zScore) > 3) severity = 'high';
      else if (Math.abs(zScore) > 2.5) severity = 'medium';

      anomalies.push({
        transactionId: t.id,
        amount: t.amount,
        description: t.description,
        date: t.date,
        category: t.category?.name || 'Uncategorized',
        reason: `Unusual amount: $${t.amount.toFixed(2)} (${zScore > 0 ? 'much higher' : 'much lower'} than average $${stats.mean.toFixed(2)})`,
        severity,
      });
    }
  });

  return { anomalies };
}
