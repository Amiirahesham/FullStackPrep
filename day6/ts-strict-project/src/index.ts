type UUID = string;

enum TransactionStatus {
  Pending = "PENDING",
  Completed = "COMPLETED",
  Failed = "FAILED",
  Refunded = "REFUNDED"
}

enum Currency {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP"
}

interface Money {
  amount: number;
  currency: Currency;
}

interface Customer {
  id: UUID;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

interface Transaction {
  transactionId: UUID;
  customerId: UUID;
  total: Money;
  status: TransactionStatus;
  createdAt: Date;
}

type TransactionResult =
  | { success: true; data: Transaction }
  | { success: false; error: string };

const customers: Map<UUID, Customer> = new Map();
const transactions: Map<UUID, Transaction> = new Map();

function generateUUID(): UUID {
  return crypto.randomUUID();
}

function registerCustomer(firstName: string, lastName: string, email: string): Customer {
  const newCustomer: Customer = {
    id: generateUUID(),
    firstName,
    lastName,
    email,
    isActive: true
  };
  
  customers.set(newCustomer.id, newCustomer);
  return newCustomer;
}

function getCustomer(id: UUID): Customer | undefined {
  return customers.get(id);
}

function processPayment(customerId: UUID, amount: number, currency: Currency): TransactionResult {
  const customer = getCustomer(customerId);

  if (!customer) {
    return { success: false, error: "Customer record not found" };
  }

  if (!customer.isActive) {
    return { success: false, error: "Customer account is deactivated" };
  }

  if (amount <= 0) {
     return { success: false, error: "Invalid payment amount" };
  }

  const newTransaction: Transaction = {
    transactionId: generateUUID(),
    customerId: customer.id,
    total: { amount, currency },
    status: TransactionStatus.Completed,
    createdAt: new Date()
  };

  transactions.set(newTransaction.transactionId, newTransaction);

  return { success: true, data: newTransaction };
}

function getCustomerHistory(customerId: UUID): Transaction[] {
  const history: Transaction[] = [];
  
  for (const [_, transaction] of transactions) {
    if (transaction.customerId === customerId) {
      history.push(transaction);
    }
  }
  
  return history;
}

function refundTransaction(transactionId: UUID): TransactionResult {
  const transaction = transactions.get(transactionId);

  if (!transaction) {
    return { success: false, error: "Transaction not found" };
  }

  if (transaction.status !== TransactionStatus.Completed) {
    return { success: false, error: "Only completed transactions can be refunded" };
  }

  transaction.status = TransactionStatus.Refunded;
  transactions.set(transactionId, transaction);

  return { success: true, data: transaction };
}