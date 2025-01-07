import { Database } from "bun:sqlite";
import { User } from "../../domain/entities/user.entity";
import { UserRepository } from "../../domain/repositories/user.repository";
import { ENV } from "../../config/env";

export class SQLiteUserRepository implements UserRepository {
  private db: Database;

  constructor() {
    this.db = new Database(ENV.DATABASE_URL);
    this.initTable();
  }

  private initTable() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async create(user: User): Promise<User> {
    const query = this.db.prepare(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)"
    );
    const result = query.run(user.email, user.password, user.name);

    return {
      ...user,
      id: result.lastInsertRowid?.toString(),
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = this.db.prepare("SELECT * FROM users WHERE email = ?");
    const user = query.get(email) as User | null;
    return user;
  }
}
