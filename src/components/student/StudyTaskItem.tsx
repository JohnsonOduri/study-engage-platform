
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, Clock, Trash2 } from "lucide-react";
import { StudyTask } from "./types/StudyPlannerTypes";

interface StudyTaskItemProps {
  task: StudyTask;
  courseTitle: string;
  onToggleCompletion: (courseTitle: string, taskId: string) => void;
  onDelete: (courseTitle: string, taskId: string) => void;
}

export const StudyTaskItem = ({
  task,
  courseTitle,
  onToggleCompletion,
  onDelete,
}: StudyTaskItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg",
        task.completed
          ? "border-green-200 bg-green-50 dark:bg-green-900/10"
          : "border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer",
            task.completed ? "bg-green-500" : "border border-muted"
          )}
          onClick={() => onToggleCompletion(courseTitle, task.id)}
        >
          {task.completed && <Check className="h-4 w-4 text-white" />}
        </div>
        <div>
          <h4 className="font-medium">{task.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {task.time}
            </div>
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {task.duration} min
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!task.completed && (
          <Button
            variant="outline"
            size="sm"
            className="text-green-600 border-green-200"
            onClick={() => onToggleCompletion(courseTitle, task.id)}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(courseTitle, task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
