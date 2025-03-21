
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface AddStudySessionProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const AddStudySession = ({ onSubmit }: AddStudySessionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Study Session</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              name="task-title"
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course">Course</Label>
            <Input id="course" name="course" placeholder="Select course" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Start Time</Label>
              <Input id="time" name="time" type="time" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="5"
                step="5"
                defaultValue="30"
              />
            </div>
          </div>

          <Button type="submit" className="w-full mt-2">
            Add to Plan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
