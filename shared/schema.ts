import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Lesson model
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  gradeLevel: text("grade_level").notNull(),
  lessonStyle: text("lesson_style").notNull(),
  additionalInstructions: text("additional_instructions"),
  includeQuiz: boolean("include_quiz").default(false),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readTime: integer("read_time").notNull(),
  quiz: jsonb("quiz"),
});

// Question model for quizzes
export const quizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.number(),
});

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

// Lesson insert schema
export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

// Create lesson input schema
export const createLessonInputSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  lessonStyle: z.string().min(1, "Lesson style is required"),
  additionalInstructions: z.string().optional(),
  includeQuiz: z.boolean().default(false),
});

export type CreateLessonInput = z.infer<typeof createLessonInputSchema>;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;
