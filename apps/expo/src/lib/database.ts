import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("everynote.db");

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    try {
    // Define interfaces for database tables
    interface User {
      id: string;
      email: string;
      name: string;
      image?: string;
      created_at?: string;
      updated_at?: string;
    }

    interface Category {
      id: string;
      name: string;
      user_id: string;
      created_at?: string;
    }

    interface Note {
      id: string;
      title?: string;
      content: string;
      category_id?: string;
      user_id: string;
      created_at?: string;
      updated_at?: string;
    }

    db.withTransactionSync((): void => {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
      db.execSync(
        `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`
      );

      db.execSync(`
        CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
      `);
      db.execSync(
        `CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);`
      );

      db.execSync(`
        CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT NOT NULL,
        category_id TEXT,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
      `);
      db.execSync(
        `CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);`
      );
      db.execSync(
        `CREATE INDEX IF NOT EXISTS idx_notes_category_id ON notes(category_id);`
      );
    });
      resolve();
    } catch (error) {
      reject(
        error instanceof Error
          ? error
          : new Error("Database initialization failed"),
      );
    }
  });
};

export { db };
