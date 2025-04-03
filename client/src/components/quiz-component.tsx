import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";
import type { QuizQuestion } from "@shared/schema";

interface QuizComponentProps {
  quiz: QuizQuestion[];
}

export default function QuizComponent({ quiz }: QuizComponentProps) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<number[]>(new Array(quiz.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Handle answer selection
  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    if (submitted) return; // Disable changes after submission
    
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };
  
  // Submit quiz
  const handleSubmit = () => {
    // Check if all questions are answered
    if (answers.includes(-1)) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate score
    let correctCount = 0;
    quiz.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    setScore(correctCount);
    setSubmitted(true);
    
    toast({
      title: "Quiz Submitted",
      description: `You scored ${correctCount} out of ${quiz.length} correct!`,
    });
  };
  
  // Reset quiz
  const handleReset = () => {
    setAnswers(new Array(quiz.length).fill(-1));
    setSubmitted(false);
    setScore(0);
  };
  
  return (
    <Card>
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-xl">Comprehension Quiz</CardTitle>
        <CardDescription>Test your understanding of the lesson material.</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {quiz.map((question, questionIndex) => (
          <div key={questionIndex} className="space-y-4">
            <h3 className="font-medium text-lg">{question.question}</h3>
            <RadioGroup
              value={answers[questionIndex].toString()}
              onValueChange={(value) => handleAnswerChange(questionIndex, parseInt(value))}
            >
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <div 
                    key={optionIndex} 
                    className={`flex items-center ${
                      submitted && (
                        optionIndex === question.correctAnswer
                          ? "text-green-600 dark:text-green-400 font-medium"
                          : answers[questionIndex] === optionIndex
                            ? "text-red-600 dark:text-red-400"
                            : ""
                      )
                    }`}
                  >
                    <RadioGroupItem 
                      value={optionIndex.toString()} 
                      id={`q${questionIndex}-${optionIndex}`} 
                      disabled={submitted}
                      className={submitted && optionIndex === question.correctAnswer
                        ? "text-green-600 border-green-600"
                        : ""
                      }
                    />
                    <Label 
                      htmlFor={`q${questionIndex}-${optionIndex}`} 
                      className="ml-3 cursor-pointer"
                    >
                      {option}
                    </Label>
                    
                    {/* Show correct/incorrect indicator after submission */}
                    {submitted && optionIndex === question.correctAnswer && (
                      <Check className="ml-2 h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                    {submitted && answers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer && (
                      <X className="ml-2 h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-750 p-6 flex justify-end">
        {submitted ? (
          <div className="w-full flex justify-between items-center">
            <div>
              <span className="font-medium">Your score: </span>
              <span className="text-lg">{score}/{quiz.length} ({Math.round(score/quiz.length * 100)}%)</span>
            </div>
            <Button onClick={handleReset}>
              Retake Quiz
            </Button>
          </div>
        ) : (
          <Button onClick={handleSubmit}>
            Submit Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
