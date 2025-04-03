import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
      <Button
        type="button"
        variant="ghost"
        className={`px-3 py-2 ${
          viewMode === 'grid'
            ? 'bg-gray-100 dark:bg-gray-600 text-primary-600 dark:text-primary-400'
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
        } hover:bg-gray-100 dark:hover:bg-gray-600 border-r border-gray-300 dark:border-gray-600 rounded-none h-9`}
        onClick={() => onViewModeChange('grid')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        className={`px-3 py-2 ${
          viewMode === 'list'
            ? 'bg-gray-100 dark:bg-gray-600 text-primary-600 dark:text-primary-400'
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
        } hover:bg-gray-100 dark:hover:bg-gray-600 rounded-none h-9`}
        onClick={() => onViewModeChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
