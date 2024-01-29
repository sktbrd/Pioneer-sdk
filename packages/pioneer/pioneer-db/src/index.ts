const TAG = ' | Pioneer-db | ';

// Import sqlite3 for Node.js environment
let sqlite3: any;
if (typeof window === 'undefined') {
  sqlite3 = require('sqlite3').verbose();
}

export class DB {
  public status: string;
  public init: (setup: any) => Promise<any>;
  private foo: () => Promise<string>;
  private setItem: (key: string, value: any) => Promise<void>;
  private getItem: (key: string) => Promise<any>;
  private dbName: string;
  private storeName: string;
  private db: any;

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
                const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
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

    this.foo = async () => {
      const tag = `${TAG} | foo | `;
      try {
        return 'bar';
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
                console.log('Key-value pair stored successfully');
                resolve();
              }
            }
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
          this.db.get('SELECT value FROM key_value_store WHERE key = ?', [key], function (err, row) {
            if (err) {
              console.error('Error retrieving value by key:', err.message);
              reject(err);
            } else if (row) {
              resolve(JSON.parse(row.value));
            } else {
              resolve(null);
            }
          });
        });
      }
    };
  }
}

export default DB;
