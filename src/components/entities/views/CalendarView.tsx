"use client";

import { useMemo, useState } from "react";
import { E_FieldDataType } from "@/components/entities/FieldEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";



import { EntityRecord, EntityField } from "@/types/entity";

interface CalendarConfig {
  dateField: string;
  titleField: string;
}

interface CalendarViewProps {
  records: EntityRecord[];
  fields: EntityField[];
  calendarConfig?: CalendarConfig;
  onEdit: (record: EntityRecord) => void;
  onDelete: (record: EntityRecord) => void;
  onTogglePublish: (record: EntityRecord) => void;
}

export const CalendarView = ({ records, fields, calendarConfig, onEdit, onDelete, onTogglePublish }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getFieldValue = (record: EntityRecord, fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return null;
    return record.data[field.name];
  };

  const dateField = fields.find(f => f.id === calendarConfig?.dateField);
  const titleField = fields.find(f => f.id === calendarConfig?.titleField) || fields[0];

  const recordsByDate = useMemo(() => {
    if (!dateField) return {};

    const map: Record<string, EntityRecord[]> = {};
    records.forEach(record => {
      const date = record.data[dateField.name];
      if (date) {
        const dateKey = new Date(date).toDateString();
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(record);
      }
    });
    return map;
  }, [records, dateField]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  if (!calendarConfig || !dateField) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please configure the Calendar view by selecting a date field in View Options.
      </div>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-32 p-2 border bg-muted/30" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = date.toDateString();
    const dayRecords = recordsByDate[dateKey] || [];

    days.push(
      <div key={day} className="min-h-32 p-2 border bg-card hover:bg-accent/50 transition-colors">
        <div className="font-medium text-sm mb-2">{day}</div>
        <div className="space-y-1">
          {dayRecords.slice(0, 3).map(record => {
            const title = getFieldValue(record, titleField.id) || 'Untitled';
            return (
              <div
                key={record.id}
                className="text-xs p-1 rounded bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors truncate"
                onClick={() => onEdit(record)}
                title={title}
              >
                {title}
              </div>
            );
          })}
          {dayRecords.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayRecords.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0 border rounded-lg overflow-hidden">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center font-semibold bg-muted border-b">
            {day}
          </div>
        ))}
        {days}
      </div>
    </div>
  );
};
