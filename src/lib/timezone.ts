import { zonedTimeToUtc, utcToZonedTime, format } from 'date-fns-tz'
import { addHours, isAfter, isBefore, addDays, startOfDay, addMinutes } from 'date-fns'

export interface TimeBlock {
  start: Date
  end: Date
  timezone: string
}

export interface AvailabilitySlot {
  userId: string
  startTime: Date
  endTime: Date
  timezone: string
}

export function convertToUtc(date: Date, timezone: string): Date {
  return zonedTimeToUtc(date, timezone)
}

export function convertFromUtc(date: Date, timezone: string): Date {
  return utcToZonedTime(date, timezone)
}

export function findOverlappingTimeBlocks(
  availabilities: AvailabilitySlot[],
  meetingDurationMinutes: number,
  requiredParticipants: number
): TimeBlock[] {
  const overlaps: TimeBlock[] = []
  
  // Convert all availabilities to UTC
  const utcAvailabilities = availabilities.map(av => ({
    ...av,
    startTime: convertToUtc(av.startTime, av.timezone),
    endTime: convertToUtc(av.endTime, av.timezone)
  }))

  // Group by user to ensure we don't double-count
  const userAvailabilities = new Map<string, typeof utcAvailabilities>()
  
  utcAvailabilities.forEach(av => {
    if (!userAvailabilities.has(av.userId)) {
      userAvailabilities.set(av.userId, [])
    }
    userAvailabilities.get(av.userId)!.push(av)
  })

  // Find all possible time slots
  const allSlots: Date[] = []
  utcAvailabilities.forEach(av => {
    let current = av.startTime
    while (current <= av.endTime) {
      if (!allSlots.some(slot => slot.getTime() === current.getTime())) {
        allSlots.push(new Date(current))
      }
      current = addMinutes(current, 30) // 30-minute intervals
    }
  })

  allSlots.sort((a, b) => a.getTime() - b.getTime())

  // Check each potential meeting slot
  for (const startTime of allSlots) {
    const endTime = addMinutes(startTime, meetingDurationMinutes)
    
    // Count how many users are available for this entire time block
    let availableUsers = 0
    
    for (const [userId, userAvails] of userAvailabilities) {
      const isAvailable = userAvails.some(av => 
        !isAfter(startTime, av.endTime) && 
        !isBefore(endTime, av.startTime)
      )
      
      if (isAvailable) {
        availableUsers++
      }
    }

    if (availableUsers >= requiredParticipants) {
      overlaps.push({
        start: startTime,
        end: endTime,
        timezone: 'UTC'
      })
    }
  }

  return overlaps
}

export function findConsecutiveDaySlots(
  overlaps: TimeBlock[],
  numberOfMeetings: number = 3
): TimeBlock[][] {
  const consecutiveSlots: TimeBlock[][] = []
  
  // Group overlaps by day
  const dayGroups = new Map<string, TimeBlock[]>()
  
  overlaps.forEach(overlap => {
    const dayKey = format(overlap.start, 'yyyy-MM-dd', { timeZone: 'UTC' })
    if (!dayGroups.has(dayKey)) {
      dayGroups.set(dayKey, [])
    }
    dayGroups.get(dayKey)!.push(overlap)
  })

  const sortedDays = Array.from(dayGroups.keys()).sort()
  
  // Find consecutive day combinations
  for (let i = 0; i <= sortedDays.length - numberOfMeetings; i++) {
    const consecutiveDays = sortedDays.slice(i, i + numberOfMeetings)
    
    // Check if days are actually consecutive
    let areConsecutive = true
    for (let j = 1; j < consecutiveDays.length; j++) {
      const prevDay = new Date(consecutiveDays[j - 1])
      const currentDay = new Date(consecutiveDays[j])
      const nextDay = addDays(prevDay, 1)
      
      if (format(nextDay, 'yyyy-MM-dd') !== format(currentDay, 'yyyy-MM-dd')) {
        areConsecutive = false
        break
      }
    }
    
    if (areConsecutive) {
      // Get one slot from each day
      const daySlots: TimeBlock[] = []
      for (const day of consecutiveDays) {
        const daySlot = dayGroups.get(day)?.[0] // Take first available slot of the day
        if (daySlot) {
          daySlots.push(daySlot)
        }
      }
      
      if (daySlots.length === numberOfMeetings) {
        consecutiveSlots.push(daySlots)
      }
    }
  }
  
  return consecutiveSlots
}

export function formatTimeInTimezone(date: Date, timezone: string): string {
  return format(convertFromUtc(date, timezone), 'MMM d, yyyy h:mm a zzz', { timeZone: timezone })
}