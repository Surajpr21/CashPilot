export declare function seedIncomeTransaction(params: {
  userId: string;
  amount: number;
  occurredOn: string;
  note?: string;
}): Promise<{ id?: string } | null>;
