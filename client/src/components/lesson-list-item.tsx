import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeletionDialog from "@/components/deletion-dialog";
import type { Lesson } from "@shared/schema";

interface LessonListItemProps {
  lesson: Lesson;
}

export default function LessonListItem({ lesson }: LessonListItemProps) {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Format relative time (e.g., "2 days ago")
  const formattedTime = formatDistanceToNow(new Date(lesson.createdAt), { addSuffix: true });
  
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
  
  // Delete lesson mutation
  const deleteLesson = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('DELETE', `/api/lessons/${lesson.id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/lessons'] });
      toast({
        title: "Lesson Deleted",
        description: "The lesson has been successfully deleted.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the lesson. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Extract first paragraph of content for preview
  const getContentPreview = (content: string) => {
    // Extract text from HTML and limit to a reasonable length
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || div.innerText || "";
    return text.substring(0, 150) + (text.length > 150 ? "..." : "");
  };
  
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="font-medium text-lg text-primary-600 dark:text-primary-400">
              {lesson.topic}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {formatGradeLevel(lesson.gradeLevel)} • Created {formattedTime}
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 line-clamp-2 sm:max-w-xl">
              {getContentPreview(lesson.content)}
            </p>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center sm:space-y-4">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {lesson.readTime} min read
            </span>
            <div className="flex space-x-2">
              <Link href={`/lessons/${lesson.id}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                >
                  View
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-red-500 hover:bg-transparent"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <DeletionDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteLesson.mutate()}
        isPending={deleteLesson.isPending}
      />
    </>
  );
}
