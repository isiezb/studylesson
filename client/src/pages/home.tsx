import { useState } from "react";
import CreateLessonForm from "@/components/create-lesson-form";
import RecentLessons from "@/components/recent-lessons";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Fetch recent lessons (last 3)
  const { data: lessons, isLoading } = useQuery({
    queryKey: ['/api/lessons'],
    select: (data) => data.slice(0, 3),
    enabled: formSubmitted // Only fetch after first form submission
  });

  return (
    <div className="max-w-3xl mx-auto">
      {/* Create Lesson Form */}
      <CreateLessonForm onSubmitSuccess={() => setFormSubmitted(true)} />
      
      {/* Recent Lessons Section - Only show after first submission */}
      {formSubmitted && (
        <div className="mt-8">
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Recently Generated Lessons</h3>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <div className="flex justify-end space-x-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <RecentLessons lessons={lessons || []} />
          )}
        </div>
      )}
    </div>
  );
}
