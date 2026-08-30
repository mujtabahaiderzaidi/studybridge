import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, text, timestamp, boolean, date } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const opportunitiesTable = pgTable("studybridge_opportunities", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  organization: text("organization").notNull(),
  type: text("type").notNull(),
  deadline: date("deadline", { mode: "string" }).notNull(),
  tags: text("tags").array().notNull().default([]),
  description: text("description").notNull(),
  saved: boolean("saved").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
});

export const sessionsTable = pgTable("studybridge_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  participantCount: integer("participant_count").notNull().default(1),
  status: text("status").notNull().default("upcoming"),
});

export const activityTable = pgTable("studybridge_activity", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOpportunitySchema = createInsertSchema(opportunitiesTable);
export const insertSessionSchema = createInsertSchema(sessionsTable);
export const insertActivitySchema = createInsertSchema(activityTable);

export type Opportunity = typeof opportunitiesTable.$inferSelect;
export type Session = typeof sessionsTable.$inferSelect;
export type Activity = typeof activityTable.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;