import * as SQLite from "expo-sqlite";

let db = null;

const openDB = () => {
  if (db) return db;

  if (SQLite.openDatabaseSync) {
    db = SQLite.openDatabaseSync("FoodJournal.db");
  } else if (SQLite.openDatabase) {
    db = SQLite.openDatabase("FoodJournal.db");
  } else {
    throw new Error("SQLite openDatabase is not available");
  }

  return db;
};

export const executeQuery = (query, params = []) => {
  const database = openDB();

  if (database.runAsync) {
    return database.runAsync(query, params);
  }

  if (database.getAllAsync) {
    return database.getAllAsync(query, params);
  }

  return new Promise((resolve, reject) => {
    database.transaction((tx) => {
      tx.executeSql(
        query,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const initDatabase = async () => {
  const database = openDB();

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    );
  `);

  await executeQuery(`
    CREATE TABLE IF NOT EXISTS journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      title TEXT,
      description TEXT,
      imageUri TEXT,
      category TEXT,
      date TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return database;
};

export default {
  initDatabase,
  executeQuery,
};