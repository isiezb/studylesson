from typing import List, Optional, Dict
import logging
from datetime import datetime

from api.models.lesson import Lesson, LessonCreate, QuizQuestion

logger = logging.getLogger("api.services.storage")

class LessonStorage:
    """In-memory storage for lessons"""
    
    def __init__(self):
        """Initialize the storage with an empty lessons dictionary and counter"""
        self.lessons: Dict[int, Lesson] = {}
        self.counter: int = 1
        self._add_example_lessons()
        
    def get_all_lessons(self) -> List[Lesson]:
        """Get all lessons"""
        return list(self.lessons.values())
    
    def get_lesson(self, lesson_id: int) -> Optional[Lesson]:
        """Get a lesson by ID"""
        return self.lessons.get(lesson_id)
    
    def create_lesson(self, lesson: LessonCreate) -> Lesson:
        """Create a new lesson"""
        lesson_id = self.counter
        self.counter += 1
        
        # Create new lesson
        new_lesson = Lesson(
            id=lesson_id,
            topic=lesson.topic,
            gradeLevel=lesson.gradeLevel,
            lessonStyle=lesson.lessonStyle,
            content=lesson.content,
            readTime=lesson.readTime,
            createdAt=datetime.now(),
            includeQuiz=lesson.includeQuiz,
            quiz=lesson.quiz
        )
        
        # Store the lesson
        self.lessons[lesson_id] = new_lesson
        
        return new_lesson
    
    def update_lesson(self, lesson_id: int, content: str, read_time_increment: int) -> Optional[Lesson]:
        """Update a lesson with additional content"""
        existing_lesson = self.get_lesson(lesson_id)
        if not existing_lesson:
            return None
        
        # Update the lesson
        updated_lesson = Lesson(
            id=existing_lesson.id,
            topic=existing_lesson.topic,
            gradeLevel=existing_lesson.gradeLevel,
            lessonStyle=existing_lesson.lessonStyle,
            content=existing_lesson.content + "\n\n" + content,
            readTime=existing_lesson.readTime + read_time_increment,
            createdAt=existing_lesson.createdAt,
            includeQuiz=existing_lesson.includeQuiz,
            quiz=existing_lesson.quiz
        )
        
        # Store the updated lesson
        self.lessons[lesson_id] = updated_lesson
        
        return updated_lesson
    
    def delete_lesson(self, lesson_id: int) -> bool:
        """Delete a lesson by ID"""
        if lesson_id in self.lessons:
            del self.lessons[lesson_id]
            return True
        return False
    
    def _add_example_lessons(self):
        """Add example lessons for development/demo purposes"""
        example_lessons = [
            LessonCreate(
                topic="Introduction to Photosynthesis",
                gradeLevel="middle_school",
                lessonStyle="interactive",
                content="""# Introduction to Photosynthesis

Photosynthesis is the process by which plants, algae, and some bacteria convert light energy, usually from the sun, into chemical energy in the form of glucose or other sugars.

## The Process of Photosynthesis

The process of photosynthesis can be summarized by the following equation:

6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

This means that carbon dioxide and water, with the help of light energy, are transformed into glucose and oxygen.

## Why Photosynthesis Matters

Photosynthesis is crucial for life on Earth for several reasons:

1. It produces oxygen, which most organisms need to breathe
2. It removes carbon dioxide from the atmosphere
3. It creates the basis for most food chains on Earth

## Parts of a Plant Involved in Photosynthesis

The primary site of photosynthesis in plants is the leaf. Within the leaf cells are structures called chloroplasts, which contain the green pigment chlorophyll. This pigment captures light energy, which is the first step in the photosynthesis process.

## Stages of Photosynthesis

Photosynthesis occurs in two main stages:

1. **Light-dependent reactions**: These take place in the thylakoid membrane and convert light energy into chemical energy
2. **Light-independent reactions** (Calvin cycle): These take place in the stroma and use the chemical energy to produce glucose

## Fun Fact

Did you know that the oxygen we breathe today was likely produced by photosynthetic organisms like plants and algae? That's why conserving forests and oceans is so important for our planet!""",
                readTime=5,
                includeQuiz=True,
                quiz=[
                    QuizQuestion(
                        question="What is the primary pigment in plants that captures light energy?",
                        options=["Melanin", "Chlorophyll", "Hemoglobin", "Carotene"],
                        correctAnswer=1
                    ),
                    QuizQuestion(
                        question="Which gas is produced during photosynthesis?",
                        options=["Carbon Dioxide", "Nitrogen", "Oxygen", "Hydrogen"],
                        correctAnswer=2
                    ),
                    QuizQuestion(
                        question="Where does the light-independent reaction take place in the chloroplast?",
                        options=["Thylakoid membrane", "Cell wall", "Stroma", "Mitochondria"],
                        correctAnswer=2
                    )
                ]
            ),
            LessonCreate(
                topic="Introduction to Fractions",
                gradeLevel="elementary",
                lessonStyle="visual",
                content="""# Introduction to Fractions

Fractions are a way of representing parts of a whole. They are very useful in everyday life!

## What is a Fraction?

A fraction has two parts:
- The **numerator** (top number) tells us how many parts we have
- The **denominator** (bottom number) tells us how many equal parts the whole is divided into

For example, in the fraction 3/4:
- 3 is the numerator
- 4 is the denominator

This means we have 3 out of 4 equal parts.

## Visual Representation

Fractions can be easily understood using visual models:

1. **Pie or circle model**: A circle divided into equal parts
2. **Bar model**: A rectangle divided into equal parts
3. **Number line**: Points on a number line between whole numbers

## Types of Fractions

1. **Proper fractions**: The numerator is less than the denominator (e.g., 3/4)
2. **Improper fractions**: The numerator is greater than or equal to the denominator (e.g., 5/4)
3. **Mixed numbers**: A whole number and a proper fraction (e.g., 1 1/4)

## Equivalent Fractions

Equivalent fractions represent the same value but use different numbers. To find equivalent fractions, multiply or divide both the numerator and denominator by the same number.

For example:
1/2 = 2/4 = 3/6 = 4/8

## Fractions in Real Life

We use fractions every day! Some examples include:
- Measuring ingredients in cooking (1/2 cup of sugar)
- Telling time (quarter past three, half past four)
- Sales and discounts (25% off = 1/4 off)

## Remember!

The denominator cannot be zero because you cannot divide something into zero parts.""",
                readTime=4,
                includeQuiz=True,
                quiz=[
                    QuizQuestion(
                        question="In the fraction 5/8, what is the denominator?",
                        options=["5", "8", "13", "40"],
                        correctAnswer=1
                    ),
                    QuizQuestion(
                        question="Which of these is an improper fraction?",
                        options=["3/4", "2/5", "7/6", "1/2"],
                        correctAnswer=2
                    ),
                    QuizQuestion(
                        question="Which fraction is equivalent to 1/2?",
                        options=["2/5", "3/5", "2/6", "3/6"],
                        correctAnswer=3
                    )
                ]
            )
        ]
        
        for lesson in example_lessons:
            self.create_lesson(lesson)