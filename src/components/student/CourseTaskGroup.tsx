
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { StudyTaskItem } from "./StudyTaskItem";
import { CourseTaskGroup as CourseTaskGroupType } from "./types/StudyPlannerTypes";

interface CourseTaskGroupProps {
  course: CourseTaskGroupType;
  onToggleTaskCompletion: (courseTitle: string, taskId: string) => void;
  onDeleteTask: (courseTitle: string, taskId: string) => void;
}

export const CourseTaskGroup = ({
  course,
  onToggleTaskCompletion,
  onDeleteTask,
}: CourseTaskGroupProps) => {
  return (
    <Card key={course.title}>
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {course.tasks.map((task) => (
            <StudyTaskItem
              key={task.id}
              task={task}
              courseTitle={course.title}
              onToggleCompletion={onToggleTaskCompletion}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </CardFooter>
    </Card>
  );
};
