import { Switch, Route } from "wouter";
import { useEffect } from "react";
import AppHeader from "@/components/app-header";
import TabNavigation from "@/components/tab-navigation";
import Home from "@/pages/home";
import LessonsList from "@/pages/lessons-list";
import LessonDetail from "@/pages/lesson-detail";
import LoadingOverlay from "@/components/loading-overlay";
import NotFound from "@/pages/not-found";
import { useTheme } from "@/hooks/use-theme";

function App() {
  const { theme } = useTheme();

  // Apply theme class to document element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen flex flex-col font-sans transition-colors duration-200">
      <AppHeader />
      <TabNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/lessons" component={LessonsList} />
          <Route path="/lessons/:id" component={LessonDetail} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <LoadingOverlay />
    </div>
  );
}

export default App;
