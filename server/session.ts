import session from "express-session";
import type { Express } from "express";
import MemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";

export async function setupSession(app: Express) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for development, PostgreSQL store for production
  let store;
  if (process.env.NODE_ENV === "production") {
    const pgStore = connectPgSimple(session);
    store = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: sessionTtl,
      tableName: "sessions",
    });
  } else {
    // Use memory store for development
    const memoryStore = MemoryStore(session);
    store = new memoryStore({
      checkPeriod: sessionTtl,
    });
  }

  app.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-key-change-in-production",
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));
}