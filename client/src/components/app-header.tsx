import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-primary-600 dark:text-primary-400 text-2xl">
            <GraduationCap />
          </div>
          <div>
            <h1 className="font-bold text-lg sm:text-xl text-primary-600 dark:text-primary-400">
              LessonCraft AI
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI-Powered Lesson Creation
            </p>
          </div>
        </div>
        
        {/* Theme Toggle Button */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleTheme}
          className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5 text-yellow-300" />
          ) : (
            <Moon className="h-5 w-5 text-gray-700" />
          )}
        </Button>
      </div>
    </header>
  );
}
