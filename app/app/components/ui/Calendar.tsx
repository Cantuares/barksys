import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  highlightedDates?: string[]; // ISO date strings
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  highlightedDates = [],
  minDate,
  maxDate,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const monthNames = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(i18n.language, { month: 'long' });
    return Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2000, i, 1);
      return formatter.format(date);
    });
  }, [i18n.language]);

  const weekDays = useMemo(() => {
    // Custom abbreviated weekday names for Portuguese
    if (i18n.language === 'pt-PT' || i18n.language === 'pt') {
      return ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    }

    // Use Intl for other languages (like English)
    const formatter = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' });
    // Start from Sunday (0) to Saturday (6)
    // Using January 2, 2000 which was a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2000, 0, 2 + i);
      return formatter.format(date);
    });
  }, [i18n.language]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateHighlighted = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return highlightedDates.includes(dateString);
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isHighlighted = isDateHighlighted(date);
      const isSelected = isDateSelected(date);
      const isDisabled = isDateDisabled(date);
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();

      days.push(
        <button
          key={day}
          onClick={() => !isDisabled && onDateSelect(date)}
          disabled={isDisabled}
          className={`
            p-2 rounded-lg text-sm font-medium transition-all
            ${isSelected ? 'bg-green-500 text-white' : ''}
            ${isHighlighted && !isSelected ? 'bg-green-100 text-green-700' : ''}
            ${isToday && !isSelected ? 'border border-green-500' : ''}
            ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-green-50 cursor-pointer'}
            ${!isSelected && !isHighlighted && !isToday ? 'text-gray-700' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className={`bg-white rounded-xl p-4 shadow-lg ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={previousMonth}
          className="!p-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <h3 className="text-lg font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>

        <Button
          variant="ghost"
          size="sm"
          onClick={nextMonth}
          className="!p-2"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>

      {/* Legend */}
      {highlightedDates.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-100" />
              <span>{t('calendar.availableSessions')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>{t('calendar.selected')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
