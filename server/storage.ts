import { lessons, type Lesson, type InsertLesson, type QuizQuestion } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { log } from "./vite";

export interface IStorage {
  getLessons(): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  deleteLesson(id: number): Promise<boolean>;
  continueLesson(id: number): Promise<Lesson | undefined>;
}

// Helper for reading times
const estimateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(5, Math.ceil(wordCount / wordsPerMinute)); // Minimum 5 minutes
};

// Helper for generating quiz content
const generateQuiz = (topic: string): QuizQuestion[] => {
  // Generate a simple quiz with 3 questions
  return [
    {
      question: `What is a primary characteristic of ${topic}?`,
      options: [
        "It only applies to theoretical contexts",
        "It integrates multiple disciplinary approaches",
        "It was developed in the 21st century",
        "It requires specialized equipment to study"
      ],
      correctAnswer: 1
    },
    {
      question: `Which of the following is NOT typically associated with ${topic}?`,
      options: [
        "Systematic analysis",
        "Historical development",
        "Random application without principles",
        "Practical applications"
      ],
      correctAnswer: 2
    },
    {
      question: `What is an important consideration when studying ${topic}?`,
      options: [
        "Understanding fundamental principles",
        "Ignoring historical context",
        "Avoiding practical applications",
        "Limiting to a single perspective"
      ],
      correctAnswer: 0
    }
  ];
};

export class DatabaseStorage implements IStorage {
  constructor() {
    log('Database storage initialized', 'storage');
  }

  async getLessons(): Promise<Lesson[]> {
    try {
      return await db.select().from(lessons).orderBy(desc(lessons.createdAt));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error fetching lessons: ${errorMessage}`, 'storage');
      return [];
    }
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    try {
      const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error fetching lesson by ID ${id}: ${errorMessage}`, 'storage');
      return undefined;
    }
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    try {
      // Generate placeholder content if not provided by API
      if (!insertLesson.content) {
        insertLesson.content = `<p>Content for the lesson about ${insertLesson.topic} will be generated.</p>`;
      }
      
      // Calculate read time if not provided
      if (!insertLesson.readTime) {
        insertLesson.readTime = estimateReadTime(insertLesson.content);
      }
      
      // Generate quiz if requested
      if (insertLesson.includeQuiz && !insertLesson.quiz) {
        insertLesson.quiz = generateQuiz(insertLesson.topic);
      }

      const [newLesson] = await db.insert(lessons).values(insertLesson).returning();
      return newLesson;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error creating lesson: ${errorMessage}`, 'storage');
      throw new Error(`Failed to create lesson: ${errorMessage}`);
    }
  }

  async deleteLesson(id: number): Promise<boolean> {
    try {
      const result = await db.delete(lessons).where(eq(lessons.id, id)).returning({ id: lessons.id });
      return result.length > 0;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error deleting lesson with ID ${id}: ${errorMessage}`, 'storage');
      return false;
    }
  }

  async continueLesson(id: number): Promise<Lesson | undefined> {
    try {
      const existingLesson = await this.getLesson(id);
      if (!existingLesson) return undefined;
      
      // This will be replaced with actual API-generated content
      const additionalContent = `\n\n<h2>Advanced Concepts in ${existingLesson.topic}</h2>
<p>This section will contain additional content for the lesson.</p>`;
      
      const updatedContent = existingLesson.content + additionalContent;
      const additionalReadTime = 5; // Default 5 minutes for additional content
      
      const [updatedLesson] = await db
        .update(lessons)
        .set({
          content: updatedContent,
          readTime: existingLesson.readTime + additionalReadTime
        })
        .where(eq(lessons.id, id))
        .returning();
      
      return updatedLesson;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Error continuing lesson with ID ${id}: ${errorMessage}`, 'storage');
      return undefined;
    }
  }
}

export const storage = new DatabaseStorage();
