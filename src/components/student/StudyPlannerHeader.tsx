
import React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Bot, CalendarIcon } from "lucide-react";

interface StudyPlannerHeaderProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export const StudyPlannerHeader = ({ date, setDate }: StudyPlannerHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold">Study Planner</h2>
        <p className="text-muted-foreground">
          Plan your study sessions and track your progress
        </p>
      </div>

      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-fit flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button className="gap-2" disabled={true}>
          <Bot className="h-4 w-4" />
          Generate AI Plan (Coming Soon)
        </Button>
      </div>
    </div>
  );
};
