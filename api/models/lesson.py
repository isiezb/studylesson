from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class VocabularyItem(BaseModel):
    term: str
    definition: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correctAnswer: int

class LessonBase(BaseModel):
    topic: str
    gradeLevel: str
    lessonStyle: Optional[str] = None

class LessonGenerationRequest(LessonBase):
    additionalInstructions: Optional[str] = None
    includeQuiz: bool = False

class LessonContinuationRequest(BaseModel):
    additionalInstructions: Optional[str] = None

class Lesson(LessonBase):
    id: int
    content: str
    readTime: int
    createdAt: datetime
    includeQuiz: bool = False
    quiz: Optional[List[QuizQuestion]] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }

class LessonCreate(LessonBase):
    content: str
    readTime: int
    includeQuiz: bool = False
    quiz: Optional[List[QuizQuestion]] = None