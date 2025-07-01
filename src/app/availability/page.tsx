'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, addDays, startOfDay, addMinutes } from 'date-fns'
import { convertToUtc } from '@/lib/timezone'

interface TimeSlot {
  start: Date
  end: Date
  selected: boolean
}

export default function AvailabilityPage() {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    timezone: ''
  })
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set())
  const [currentDate, setCurrentDate] = useState(new Date())

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'Pacific/Auckland'
  ]

  const generateTimeSlots = useCallback(() => {
    if (!userInfo.timezone) return

    const slots: TimeSlot[] = []
    const startOfCurrentDay = startOfDay(currentDate)
    
    // Generate 30-minute slots from 8 AM to 8 PM
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotStart = addMinutes(startOfCurrentDay, hour * 60 + minute)
        const slotEnd = addMinutes(slotStart, 30)
        
        slots.push({
          start: slotStart,
          end: slotEnd,
          selected: false
        })
      }
    }
    
    setTimeSlots(slots)
  }, [currentDate, userInfo.timezone])

  useEffect(() => {
    generateTimeSlots()
  }, [generateTimeSlots])

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    })
  }

  const getSlotKey = (slot: TimeSlot) => {
    return `${slot.start.getTime()}-${slot.end.getTime()}`
  }

  const toggleTimeSlot = (slot: TimeSlot) => {
    const key = getSlotKey(slot)
    const newSelected = new Set(selectedSlots)
    
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    
    setSelectedSlots(newSelected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const availabilityData = {
      ...userInfo,
      availability: timeSlots
        .filter(slot => selectedSlots.has(getSlotKey(slot)))
        .map(slot => ({
          startTime: convertToUtc(slot.start, userInfo.timezone),
          endTime: convertToUtc(slot.end, userInfo.timezone),
          timezone: userInfo.timezone
        }))
    }
    
    console.log('Availability submitted:', availabilityData)
    alert('Availability submitted successfully!')
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'next' 
      ? addDays(currentDate, 1)
      : addDays(currentDate, -1)
    setCurrentDate(newDate)
  }

  const formatTimeSlot = (slot: TimeSlot) => {
    return `${format(slot.start, 'h:mm a')} - ${format(slot.end, 'h:mm a')}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Your Availability</h1>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Information */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">Your Information</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={userInfo.name}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    name="timezone"
                    value={userInfo.timezone}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select timezone</option>
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
              <button
                type="button"
                onClick={() => navigateDate('prev')}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Day
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              
              <button
                type="button"
                onClick={() => navigateDate('next')}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Next Day
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Time Slot Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Available Times ({userInfo.timezone || 'Select timezone'})
              </h2>
              
              {!userInfo.timezone ? (
                <div className="text-center py-8 text-gray-500">
                  Please select your timezone to view available time slots
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {timeSlots.map((slot, index) => {
                    const key = getSlotKey(slot)
                    const isSelected = selectedSlots.has(key)
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleTimeSlot(slot)}
                        className={`p-3 rounded-md border-2 transition-colors text-sm font-medium ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {formatTimeSlot(slot)}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Instructions</h3>
              <ul className="text-yellow-800 space-y-1 text-sm">
                <li>• Select all time slots when you would be available for meetings</li>
                <li>• Each meeting will be 3.5 hours long</li>
                <li>• We need 3 meetings, preferably on consecutive days</li>
                <li>• Select multiple options to increase scheduling flexibility</li>
                <li>• Times are shown in your local timezone</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={selectedSlots.size === 0 || !userInfo.timezone}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Submit Availability ({selectedSlots.size} slots selected)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}