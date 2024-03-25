const TAG = ' | Pioneer-db | ';

// Import sqlite3 for Node.js environment
let sqlite3: any;
if (typeof window === 'undefined') {
  sqlite3 = require('sqlite3').verbose();
}

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

export class DB {
  public status: string;
  public init: (setup: any) => Promise<any>;
  private setItem: (key: string, value: any) => Promise<void>;
  private getItem: (key: string) => Promise<any>;
  private dbName: string;
  private storeName: string;
  private db: any;
  private createTransaction: (tx: Omit<Transaction, 'id'>) => Promise<number>;
  private getTransaction: (txid: string) => Promise<Transaction | undefined>;
  private updateTransaction: (txid: string, newState: TransactionState) => Promise<void>;
  private getAllTransactions: () => Promise<Transaction[]>;
  private clearAllTransactions: () => Promise<void>;
  private openIndexedDB: () => Promise<IDBDatabase>;

  constructor(config: any) {
    this.status = 'preInit';
    this.dbName = 'sessions.db';
    this.storeName = 'key_value_store';
    this.db = typeof window === 'undefined' ? new sqlite3.Database(this.dbName) : null;

    this.init = async (setup: any) => {
      const tag = `${TAG} | init | `;
      try {
        // Browser environment
        if (typeof window !== 'undefined') {
          return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (event) => {
              const db = (event.target as IDBOpenDBRequest).result;
              if (!db.objectStoreNames.contains(this.storeName)) {
                const store = db.createObjectStore(this.storeName, {
                  keyPath: 'id',
                  autoIncrement: true,
                });
                // Add additional indexes or store creation logic here
              }
            };

            request.onerror = () => {
              reject(request.error);
            };

            request.onsuccess = () => {
              this.db = request.result;
              resolve(this.db);
            };
          });
        } else {
          // Node.js environment
          this.db.serialize(() => {
            // Add your table creation logic for SQLite here
          });
          return Promise.resolve(true);
        }
      } catch (e) {
        console.error(tag, 'e: ', e);
        throw e;
      }
    };

    this.setItem = async (key, value) => {
      // Browser environment
      if (typeof window !== 'undefined') {
        return new Promise((resolve, reject) => {
          // IndexedDB setItem logic here
        });
      } else {
        // Node.js environment
        return new Promise((resolve, reject) => {
          this.db.run(
            'INSERT OR REPLACE INTO key_value_store (key, value) VALUES (?, ?)',
            [key, JSON.stringify(value)],
            function (err) {
              if (err) {
                console.error('Error storing key-value pair:', err.message);
                reject(err);
              } else {
                //console.log('Key-value pair stored successfully');
                resolve();
              }
            },
          );
        });
      }
    };

    this.getItem = async (key) => {
      // Browser environment
      if (typeof window !== 'undefined') {
        return new Promise((resolve, reject) => {
          // IndexedDB getItem logic here
        });
      } else {
        // Node.js environment
        return new Promise((resolve, reject) => {
          this.db.get(
            'SELECT value FROM key_value_store WHERE key = ?',
            [key],
            function (err, row) {
              if (err) {
                console.error('Error retrieving value by key:', err.message);
                reject(err);
              } else if (row) {
                resolve(JSON.parse(row.value));
              } else {
                resolve(null);
              }
            },
          );
        });
      }
    };

    this.createTransaction = async (tx: Omit<Transaction, 'id'>): Promise<number> => {
      if (typeof window !== 'undefined') {
        // Browser environment: IndexedDB logic
        const db: IDBDatabase = await this.openIndexedDB();
        const txStore = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        const request = txStore.add(tx);
        return new Promise<number>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result as number);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Node.js environment: SQLite logic
        return new Promise<number>((resolve, reject) => {
          this.db.run(
            'INSERT INTO transactions (txid, state) VALUES (?, ?)',
            [tx.txid, tx.state],
            function (this: sqlite3.RunResult, err: Error | null) {
              if (err) {
                reject(err);
              } else {
                resolve(this.lastID as number);
              }
            },
          );
        });
      }
    };

    this.getTransaction = async function (txid: string): Promise<Transaction | undefined> {
      if (typeof window !== 'undefined') {
        // Browser environment: IndexedDB logic
        const db = await this.openIndexedDB();
        const txStore = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
        const index = txStore.index('txid');
        const request = index.get(txid);
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result as Transaction | undefined);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Node.js environment: SQLite logic
        return new Promise((resolve, reject) => {
          this.db.get(
            'SELECT * FROM transactions WHERE txid = ?',
            [txid],
            function (err: any, row: any) {
              if (err) reject(err);
              else resolve(row);
            },
          );
        });
      }
    };

    this.updateTransaction = async (txid: string, newState: TransactionState): Promise<void> => {
      if (typeof window !== 'undefined') {
        // Browser environment: IndexedDB logic
        const db = await this.openIndexedDB();
        const txStore = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        const index = txStore.index('txid');
        const request = index.get(txid);
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            const data = request.result;
            if (data) {
              data.state = newState;
              const updateRequest = txStore.put(data);
              updateRequest.onsuccess = () => resolve();
              updateRequest.onerror = () => reject(updateRequest.error);
            } else {
              reject(new Error('Transaction not found'));
            }
          };
          request.onerror = () => reject(request.error);
        });
      } else {
        // Node.js environment: SQLite logic
        return new Promise((resolve, reject) => {
          this.db.run(
            'UPDATE transactions SET state = ? WHERE txid = ?',
            [newState, txid],
            function (err: any) {
              if (err) reject(err);
              else resolve();
            },
          );
        });
      }
    };

    this.getAllTransactions = async function (): Promise<Transaction[]> {
      if (typeof window !== 'undefined') {
        // Browser environment: IndexedDB logic
        const db = await this.openIndexedDB();
        const txStore = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
        const request = txStore.getAll();
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve(request.result as Transaction[]);
          request.onerror = () => reject(request.error);
        });
      } else {
        // Node.js environment: SQLite logic
        return new Promise((resolve, reject) => {
          this.db.all('SELECT * FROM transactions', [], function (err: any, rows: any[]) {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      }
    };

    this.clearAllTransactions = async function (): Promise<void> {
      if (typeof window !== 'undefined') {
        // Browser environment: IndexedDB logic
        const db = await this.openIndexedDB();
        const txStore = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
        const request = txStore.clear();
        return new Promise((resolve, reject) => {
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      } else {
        // Node.js environment: SQLite logic
        return new Promise((resolve, reject) => {
          this.db.run('DELETE FROM transactions', function (err: any) {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    };

    this.openIndexedDB = async function (): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);
        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, {
              keyPath: 'id',
              autoIncrement: true,
            });
            store.createIndex('txid', 'txid', { unique: true });
            store.createIndex('state', 'state', { unique: false });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    };
  }
}

export default DB;
