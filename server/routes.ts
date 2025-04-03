import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { createLessonInputSchema, insertLessonSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all lessons
  app.get("/api/lessons", async (_req: Request, res: Response) => {
    try {
      const lessons = await storage.getLessons();
      res.json(lessons);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      res.status(500).json({ message: "Failed to fetch lessons" });
    }
  });

  // Get a specific lesson by ID
  app.get("/api/lessons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }

      const lesson = await storage.getLesson(id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      res.json(lesson);
    } catch (error) {
      console.error("Error fetching lesson:", error);
      res.status(500).json({ message: "Failed to fetch lesson" });
    }
  });

  // Create a new lesson
  app.post("/api/lessons", async (req: Request, res: Response) => {
    try {
      // Validate input
      const validatedInput = createLessonInputSchema.parse(req.body);
      
      // For a real AI-powered app, this would send the input to an AI service
      // For now, we'll use a simulated response
      
      // Generate lesson content based on input
      const simulatedAIContent = `<h2>Introduction to ${validatedInput.topic}</h2>
<p>This is an AI-generated lesson about ${validatedInput.topic}. It's designed for ${validatedInput.gradeLevel} students using a ${validatedInput.lessonStyle} approach.</p>

<h2>Key Concepts</h2>
<p>Here are some important concepts related to ${validatedInput.topic}:</p>
<ul>
  <li>Understanding the fundamentals</li>
  <li>Historical development</li>
  <li>Modern applications</li>
  <li>Future directions</li>
</ul>

<h2>Main Principles</h2>
<p>The main principles underlying ${validatedInput.topic} include systematic approaches, analytical thinking, and creative problem-solving. These principles help us understand how ${validatedInput.topic} works in various contexts.</p>

<h2>Practical Applications</h2>
<p>There are numerous practical applications of ${validatedInput.topic} in everyday life and professional settings. These applications demonstrate the versatility and importance of this subject area.</p>

<h2>Summary</h2>
<p>In this lesson, we have explored the fundamental aspects of ${validatedInput.topic}, including its key concepts, main principles, and practical applications. Understanding these elements provides a solid foundation for further study and application of this important subject.</p>`;
      
      // Create lesson object
      const lessonData = {
        ...validatedInput,
        content: simulatedAIContent,
      };
      
      // Validate the full lesson data
      const validatedLesson = insertLessonSchema.parse(lessonData);
      
      // Store the lesson
      const newLesson = await storage.createLesson(validatedLesson);
      
      res.status(201).json(newLesson);
    } catch (error) {
      console.error("Error creating lesson:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      res.status(500).json({ message: "Failed to create lesson" });
    }
  });

  // Delete a lesson
  app.delete("/api/lessons/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }

      const success = await storage.deleteLesson(id);
      if (!success) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (error) {
      console.error("Error deleting lesson:", error);
      res.status(500).json({ message: "Failed to delete lesson" });
    }
  });

  // Continue a lesson (add more content)
  app.post("/api/lessons/:id/continue", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid lesson ID" });
      }

      const updatedLesson = await storage.continueLesson(id);
      if (!updatedLesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      res.json(updatedLesson);
    } catch (error) {
      console.error("Error continuing lesson:", error);
      res.status(500).json({ message: "Failed to continue lesson" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
