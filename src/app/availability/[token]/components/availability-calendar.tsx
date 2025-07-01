'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'

interface AvailabilityCalendarProps {
  dateRangeStart: string
  dateRangeEnd: string
  meetingDuration: number // in minutes
}

interface TimeSlot {
  day: Date
  time: string // e.g., "09:00-12:30"
}

export default function AvailabilityCalendar({
  dateRangeStart,
  dateRangeEnd,
  meetingDuration
}: AvailabilityCalendarProps) {
  const [selectedDays, setSelectedDays] = useState<Date[]>([])
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([])

  const handleDayClick = (day: Date) => {
    const isSelected = selectedDays.some(selectedDay => selectedDay.getTime() === day.getTime())
    if (isSelected) {
      setSelectedDays(selectedDays.filter(selectedDay => selectedDay.getTime() !== day.getTime()))
      setSelectedTimeSlots(selectedTimeSlots.filter(slot => slot.day.getTime() !== day.getTime()))
    } else {
      setSelectedDays([...selectedDays, day])
    }
  }

  const handleTimeSlotChange = (day: Date, time: string) => {
    const newSlot = { day, time }
    const existingSlotIndex = selectedTimeSlots.findIndex(slot => slot.day.getTime() === day.getTime() && slot.time === time)

    if (existingSlotIndex > -1) {
      setSelectedTimeSlots(selectedTimeSlots.filter((_, index) => index !== existingSlotIndex))
    } else {
      setSelectedTimeSlots([...selectedTimeSlots, newSlot])
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: (window.location.pathname.split('/').pop()),
          timeSlots: selectedTimeSlots,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Availability submitted successfully!');
      } else {
        alert(`Error submitting availability: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting availability:', error);
      alert('Failed to submit availability. Please try again.');
    }
  };

  const timeOptions = [
    "09:00-12:30",
    "13:00-16:30",
    "17:00-20:30"
  ]

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex justify-center">
          <DayPicker
            mode="multiple"
            selected={selectedDays}
            onDayClick={handleDayClick}
            fromDate={new Date(dateRangeStart)}
            toDate={new Date(dateRangeEnd)}
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Time Slots</h3>
          <div className="space-y-4">
            {selectedDays.length > 0 ? (
              selectedDays.map(day => (
                <div key={day.toISOString()}>
                  <h4 className="font-medium text-gray-800">{day.toLocaleDateString()}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {timeOptions.map(time => (
                      <button
                        key={time}
                        onClick={() => handleTimeSlotChange(day, time)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedTimeSlots.some(slot => slot.day.getTime() === day.getTime() && slot.time === time)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Please select one or more days from the calendar.</p>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={selectedTimeSlots.length === 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Submit Availability
        </button>
      </div>
    </div>
  )
}
