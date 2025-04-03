CREATE TABLE IF NOT EXISTS "lessons" (
  "id" SERIAL PRIMARY KEY,
  "topic" TEXT NOT NULL,
  "grade_level" TEXT NOT NULL,
  "lesson_style" TEXT NOT NULL,
  "additional_instructions" TEXT,
  "include_quiz" BOOLEAN DEFAULT false,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT now() NOT NULL,
  "read_time" INTEGER NOT NULL,
  "quiz" JSONB
);