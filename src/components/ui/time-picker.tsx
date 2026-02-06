import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import * as LucideIcons from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const TimePicker = ({ 
  value, 
  onChange, 
  label, 
  placeholder = "HH:MM", 
  required = false,
  disabled = false 
}: TimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');

  // Parse initial value
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':');
      setHours(h.padStart(2, '0'));
      setMinutes(m.padStart(2, '0'));
    }
  }, [value]);

  const handleHourChange = (newHour: string) => {
    const hour = parseInt(newHour, 10);
    if (hour >= 0 && hour <= 23) {
      setHours(newHour.padStart(2, '0'));
      updateTime(newHour.padStart(2, '0'), minutes);
    }
  };

  const handleMinuteChange = (newMinute: string) => {
    const minute = parseInt(newMinute, 10);
    if (minute >= 0 && minute <= 59) {
      setMinutes(newMinute.padStart(2, '0'));
      updateTime(hours, newMinute.padStart(2, '0'));
    }
  };

  const updateTime = (h: string, m: string) => {
    const timeString = `${h}:${m}`;
    onChange(timeString);
  };

  const handleInputChange = (inputValue: string) => {
    // Allow typing in HH:MM format
    if (inputValue.length <= 5) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):?([0-5]?[0-9])?$/;
      if (timeRegex.test(inputValue) || inputValue === '') {
        if (inputValue.includes(':')) {
          const [h, m] = inputValue.split(':');
          if (h && m) {
            const hour = parseInt(h, 10);
            const minute = parseInt(m, 10);
            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
              setHours(h.padStart(2, '0'));
              setMinutes(m.padStart(2, '0'));
              onChange(inputValue);
            }
          } else if (h) {
            const hour = parseInt(h, 10);
            if (hour >= 0 && hour <= 23) {
              setHours(h.padStart(2, '0'));
              onChange(inputValue);
            }
          }
        } else {
          // Just typing hours
          const hour = parseInt(inputValue, 10);
          if (hour >= 0 && hour <= 23) {
            setHours(inputValue.padStart(2, '0'));
            onChange(inputValue);
          }
        }
      }
    }
  };

  const generateHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i.toString().padStart(2, '0'));
    }
    return hours;
  };

  const generateMinutes = () => {
    const minutes = [];
    for (let i = 0; i < 60; i += 15) { // 15 dakika aralıklarla
      minutes.push(i.toString().padStart(2, '0'));
    }
    return minutes;
  };

  const hoursList = generateHours();
  const minutesList = generateMinutes();

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-2">
          <LucideIcons.Clock className="w-4 h-4" />
          {label}
        </Label>
      )}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start font-mono"
            disabled={disabled}
          >
            {value || placeholder}
            <LucideIcons.ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="HH:MM"
                className="font-mono text-center"
                maxLength={5}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <LucideIcons.Check className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Saat</Label>
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {hoursList.map((hour) => (
                    <Button
                      key={hour}
                      variant={hours === hour ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-center font-mono"
                      onClick={() => handleHourChange(hour)}
                    >
                      {hour}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Dakika</Label>
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {minutesList.map((minute) => (
                    <Button
                      key={minute}
                      variant={minutes === minute ? "default" : "ghost"}
                      size="sm"
                      className="w-full justify-center font-mono"
                      onClick={() => handleMinuteChange(minute)}
                    >
                      {minute}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
