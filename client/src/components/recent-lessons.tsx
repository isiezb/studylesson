import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lesson } from "@shared/schema";

interface RecentLessonsProps {
  lessons: Lesson[];
}

export default function RecentLessons({ lessons }: RecentLessonsProps) {
  // Format grade level for display
  const formatGradeLevel = (level: string) => {
    const levelMap: Record<string, string> = {
      elementary: "Elementary School",
      middle: "Middle School",
      high: "High School",
      college: "College Level",
      adult: "Adult Education"
    };
    return levelMap[level] || level;
  };
  
  // Format relative time (e.g., "2 days ago")
  const getRelativeTime = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recently Generated Lessons</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lessons.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No lessons created yet. Start by generating your first lesson.
            </p>
          ) : (
            lessons.map(lesson => (
              <div 
                key={lesson.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <h4 className="font-medium text-primary-600 dark:text-primary-400">
                  {lesson.topic}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatGradeLevel(lesson.gradeLevel)} • Created {getRelativeTime(lesson.createdAt)}
                </p>
                <div className="flex justify-end space-x-2 mt-3">
                  <Link href={`/lessons/${lesson.id}`}>
                    <Button variant="outline" size="sm" className="text-xs h-8">
                      View
                    </Button>
                  </Link>
                  <Link href={`/lessons/${lesson.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-xs h-8 text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                    >
                      Continue
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
