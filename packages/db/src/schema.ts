// packages/db/src/schema.ts
import { sql } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
  text,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `everynote_${name}`);

export const users = createTable(
  "user",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    image: text("image"),
    googleId: varchar("google_id", { length: 255 }).unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    emailIndex: index("user_email_idx").on(table.email),
    googleIdIndex: index("user_google_id_idx").on(table.googleId),
  }),
);

// Note type enum
export const noteTypeEnum = pgEnum("note_type", [
  "TEXT",
  "VOICE",
  "IMAGE",
  "VIDEO",
]);

export const notes = createTable(
  "note",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }),
    content: text("content").notNull(),
    type: noteTypeEnum("type").default("TEXT").notNull(),
    userId: serial("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    userIdIndex: index("note_user_id_idx").on(table.userId),
    createdAtIndex: index("note_created_at_idx").on(table.createdAt),
  }),
);

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
