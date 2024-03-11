// txDb.ts
import type { DBSchema, IDBPDatabase } from 'idb';
import { openDB } from 'idb';

export enum TransactionState {
  Unsigned = 'unsigned',
  Signed = 'signed',
  Pending = 'pending',
  Completed = 'completed',
  Errored = 'errored',
}

export interface Transaction {
  id?: number;
  txid: string;
  state: TransactionState;
}

interface TransactionStore extends DBSchema {
  transactions: {
    key: number;
    value: Transaction;
    indexes: {
      txid: string;
      state: TransactionState;
    };
  };
}

class TransactionDB {
  private dbPromise: Promise<IDBPDatabase<TransactionStore>>;

  constructor() {
    this.dbPromise = openDB<TransactionStore>('MyDatabase', 1, {
      upgrade(db) {
        const objectStore = db.createObjectStore('transactions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        objectStore.createIndex('txid', 'txid', { unique: true });
        objectStore.createIndex('state', 'state', { unique: false });
      },
    });
  }

  async createTransaction(tx: Omit<Transaction, 'id'>): Promise<number> {
    const db = await this.dbPromise;
    const txid = tx.txid;
    const existingTx = await (await db.transaction('transactions').store.index('txid')).get(txid);
    if (existingTx) {
      throw new Error('Duplicate txid');
    }
    return (await db.transaction('transactions', 'readwrite').store).add(tx);
  }

  async getTransaction(txid: string): Promise<Transaction | undefined> {
    const db = await this.dbPromise;
    return (await db.transaction('transactions').store.index('txid')).get(txid);
  }

  async updateTransaction(txid: string, newState: TransactionState): Promise<void> {
    const db = await this.dbPromise;
    const tx = await (await db.transaction('transactions').store.index('txid')).get(txid);
    if (!tx) {
      throw new Error('Transaction not found');
    }
    tx.state = newState;
    await (await db.transaction('transactions', 'readwrite').store).put(tx);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const db = await this.dbPromise;
    return (await db.transaction('transactions').store).getAll();
  }

  async clearAllTransactions(): Promise<void> {
    const db = await this.dbPromise;
    await (await db.transaction('transactions', 'readwrite').store).clear();
  }
}

const transactionDB = new TransactionDB();
export default transactionDB;
