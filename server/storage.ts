import { lessons, type Lesson, type InsertLesson, type QuizQuestion } from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  getLessons(): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  deleteLesson(id: number): Promise<boolean>;
  continueLesson(id: number): Promise<Lesson | undefined>;
}

// Mock data for reading times
const getRandomReadTime = () => Math.floor(Math.random() * 20) + 10; // 10-30 minutes

export class MemStorage implements IStorage {
  private lessons: Map<number, Lesson>;
  currentId: number;

  constructor() {
    this.lessons = new Map();
    this.currentId = 1;
  }

  async getLessons(): Promise<Lesson[]> {
    return Array.from(this.lessons.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return this.lessons.get(id);
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const id = this.currentId++;
    const now = new Date();
    
    // Generate mock content if not provided
    const content = insertLesson.content || this.generateLessonContent(insertLesson.topic);
    
    // Generate quiz if requested
    const quiz = insertLesson.includeQuiz ? this.generateQuiz(insertLesson.topic) : null;
    
    const lesson: Lesson = {
      ...insertLesson,
      id,
      createdAt: now,
      content: content,
      readTime: getRandomReadTime(),
      quiz: quiz,
    };
    
    this.lessons.set(id, lesson);
    return lesson;
  }

  async deleteLesson(id: number): Promise<boolean> {
    const exists = this.lessons.has(id);
    if (exists) {
      this.lessons.delete(id);
      return true;
    }
    return false;
  }

  async continueLesson(id: number): Promise<Lesson | undefined> {
    const lesson = this.lessons.get(id);
    if (!lesson) return undefined;
    
    // Add more content to the lesson
    const additionalContent = this.generateAdditionalContent(lesson.topic);
    const updatedLesson: Lesson = {
      ...lesson,
      content: lesson.content + additionalContent,
      readTime: lesson.readTime + 5, // Add 5 more minutes to read time
    };
    
    this.lessons.set(id, updatedLesson);
    return updatedLesson;
  }

  // Helper methods for generating content
  private generateLessonContent(topic: string): string {
    return `<h2>Introduction to ${topic}</h2>
<p>This is an AI-generated lesson about ${topic}. The lesson provides a comprehensive introduction to the key concepts, principles, and applications of this subject.</p>

<h2>Key Concepts</h2>
<p>Here are some important concepts related to ${topic}:</p>
<ul>
  <li>Understanding the fundamentals</li>
  <li>Historical development</li>
  <li>Modern applications</li>
  <li>Future directions</li>
</ul>

<h2>Main Principles</h2>
<p>The main principles underlying ${topic} include systematic approaches, analytical thinking, and creative problem-solving. These principles help us understand how ${topic} works in various contexts.</p>

<h2>Practical Applications</h2>
<p>There are numerous practical applications of ${topic} in everyday life and professional settings. These applications demonstrate the versatility and importance of this subject area.</p>

<h2>Summary</h2>
<p>In this lesson, we have explored the fundamental aspects of ${topic}, including its key concepts, main principles, and practical applications. Understanding these elements provides a solid foundation for further study and application of this important subject.</p>`;
  }

  private generateAdditionalContent(topic: string): string {
    return `

<h2>Advanced Concepts in ${topic}</h2>
<p>Building on the foundation established earlier, this section explores more advanced concepts and applications in ${topic}.</p>

<h3>Deeper Analysis</h3>
<p>A deeper analysis of ${topic} reveals additional layers of complexity and nuance that weren't covered in the introductory section. These include:</p>
<ul>
  <li>Complex theoretical frameworks</li>
  <li>Interdisciplinary connections</li>
  <li>Specialized methodologies</li>
  <li>Current research developments</li>
</ul>

<h3>Case Studies</h3>
<p>Examining specific case studies helps illustrate the practical implications and applications of ${topic} in real-world scenarios. These examples provide concrete instances of how the principles and concepts are applied.</p>

<h3>Future Directions</h3>
<p>As our understanding of ${topic} continues to evolve, new directions and possibilities emerge. This section explores potential future developments and their implications for the field.</p>`;
  }

  private generateQuiz(topic: string): QuizQuestion[] {
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
  }
}

export const storage = new MemStorage();
