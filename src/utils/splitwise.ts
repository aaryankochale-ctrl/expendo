import { GroupExpense, Settlement } from '../types';

type BalanceMap = Record<string, number>;

export function calculateGroupBalances(expenses: GroupExpense[]): BalanceMap {
  const balances: BalanceMap = {};

  for (const expense of expenses) {
    if (expense.payments) {
      for (const payment of expense.payments) {
        balances[payment.user_id] = (balances[payment.user_id] || 0) + payment.amount;
      }
    }
    
    if (expense.splits) {
      for (const split of expense.splits) {
        balances[split.user_id] = (balances[split.user_id] || 0) - split.amount;
      }
    }
  }

  return balances;
}

export function calculateSettleUp(expenses: GroupExpense[]): Settlement[] {
  const balances = calculateGroupBalances(expenses);
  
  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  for (const [userId, amount] of Object.entries(balances)) {
    if (amount < 0) {
      debtors.push({ userId, amount: Math.abs(amount) });
    } else if (amount > 0) {
      creditors.push({ userId, amount });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let i = 0;
  let j = 0;
  const transactions: Settlement[] = [];

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settledAmount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      debtor: debtor.userId,
      creditor: creditor.userId,
      amount: settledAmount
    });

    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return transactions;
}
