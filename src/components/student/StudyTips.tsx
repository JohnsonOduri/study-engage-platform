
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Clock, FileText, RotateCw } from "lucide-react";

export const StudyTips = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Tips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="bg-primary/10 p-2 rounded-full h-fit">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Pomodoro Technique</h4>
              <p className="text-sm text-muted-foreground">
                Study for 25 minutes, then take a 5-minute break.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-primary/10 p-2 rounded-full h-fit">
              <RotateCw className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Spaced Repetition</h4>
              <p className="text-sm text-muted-foreground">
                Review material at increasing intervals for better retention.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-primary/10 p-2 rounded-full h-fit">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Active Recall</h4>
              <p className="text-sm text-muted-foreground">
                Test yourself rather than passively reviewing notes.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-primary/10 p-2 rounded-full h-fit">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">Cornell Note-Taking</h4>
              <p className="text-sm text-muted-foreground">
                Divide your notes into main points, details, and summary.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
