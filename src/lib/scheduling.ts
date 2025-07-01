import { prisma } from './db'
import { MeetingSeries, Availability, TeamMember, User } from '@prisma/client'

const SLOT_DURATION_MINUTES = 30

type FullMeetingSeries = MeetingSeries & {
  availabilities: (Availability & { user: User })[]
  teamMembers: TeamMember[]
}

export async function generateMeetingSchedules(meetingSeriesId: string) {
  const meetingSeries = await prisma.meetingSeries.findUnique({
    where: { id: meetingSeriesId },
    include: {
      availabilities: { include: { user: true } },
      teamMembers: true,
    },
  })

  if (!meetingSeries) {
    throw new Error('Meeting series not found')
  }

  if (meetingSeries.availabilities.length === 0) {
    return {
      option1: { meetings: [], reasoning: 'No availability data submitted yet.' },
      option2: { meetings: [], reasoning: '' },
      option3: { meetings: [], reasoning: '' },
    }
  }

  const possibleMeetings = findPossibleMeetingSlots(meetingSeries)
  const schedules = selectSchedules(possibleMeetings, meetingSeries)

  return {
    option1: schedules[0] || { meetings: [], reasoning: 'Could not find a suitable schedule.' },
    option2: schedules[1] || { meetings: [], reasoning: '' },
    option3: schedules[2] || { meetings: [], reasoning: '' },
  }
}

function findPossibleMeetingSlots(meetingSeries: FullMeetingSeries): Date[] {
  const { dateRangeStart, dateRangeEnd, teamMembers, availabilities } = meetingSeries
  const totalTeamMembers = teamMembers.length

  const slotCounts = new Map<number, Set<string>>()
  const slotDurationMs = SLOT_DURATION_MINUTES * 60 * 1000

  // 1. Populate slotCounts with available users for each slot
  for (const availability of availabilities) {
    let currentSlotTime = availability.startTime.getTime()
    const endTime = availability.endTime.getTime()

    while (currentSlotTime < endTime) {
      if (!slotCounts.has(currentSlotTime)) {
        slotCounts.set(currentSlotTime, new Set())
      }
      slotCounts.get(currentSlotTime)!.add(availability.userId)
      currentSlotTime += slotDurationMs
    }
  }

  // 2. Filter for slots where all team members are available
  const fullyAvailableSlots: number[] = []
  for (const [time, users] of slotCounts.entries()) {
    if (users.size === totalTeamMembers) {
      fullyAvailableSlots.push(time)
    }
  }
  fullyAvailableSlots.sort((a, b) => a - b)

  // 3. Find consecutive blocks of fully available slots
  const slotsNeeded = meetingSeries.meetingDuration / SLOT_DURATION_MINUTES
  const possibleMeetingStartTimes: Date[] = []

  for (let i = 0; i <= fullyAvailableSlots.length - slotsNeeded; i++) {
    let isConsecutive = true
    for (let j = 0; j < slotsNeeded - 1; j++) {
      if (fullyAvailableSlots[i + j + 1] - fullyAvailableSlots[i + j] !== slotDurationMs) {
        isConsecutive = false
        break
      }
    }
    if (isConsecutive) {
      possibleMeetingStartTimes.push(new Date(fullyAvailableSlots[i]))
    }
  }

  return possibleMeetingStartTimes
}

function selectSchedules(
  possibleMeetings: Date[],
  meetingSeries: FullMeetingSeries
) {
  const { numberOfMeetings, consecutiveDays, meetingDuration } = meetingSeries
  const finalSchedules = []

  if (possibleMeetings.length === 0) {
    return []
  }

  // This is a simplified selection logic. It just picks the first available options.
  // A more advanced version would handle consecutive days and generate more diverse options.

  let meetingsFound = 0
  const currentSchedule: any[] = []

  for (const startTime of possibleMeetings) {
    if (meetingsFound >= numberOfMeetings) {
      break
    }
    
    const endTime = new Date(startTime.getTime() + meetingDuration * 60 * 1000)
    
    // Avoid overlapping meetings
    if (!currentSchedule.some(m => startTime < m.endTime && endTime > m.startTime)) {
      currentSchedule.push({
        title: `${meetingSeries.title} - Meeting ${meetingsFound + 1}`,
        startTime,
        endTime,
      })
      meetingsFound++
    }
  }

  if (currentSchedule.length === numberOfMeetings) {
    finalSchedules.push({
      meetings: currentSchedule,
      reasoning: `Found a set of ${numberOfMeetings} meetings that fit everyone's schedule.`,
    })
  }

  return finalSchedules
}

export async function tallyVotes(meetingSchedulesId: string) {
  const votes = await prisma.scheduleVote.findMany({
    where: { meetingSchedulesId },
  })

  if (votes.length === 0) {
    return null
  }

  const scores: { [key: number]: number } = { 1: 0, 2: 0, 3: 0 }

  for (const vote of votes) {
    scores[vote.firstChoice] += 3
    scores[vote.secondChoice] += 2
    scores[vote.thirdChoice] += 1
  }

  let winningOption = -1
  let maxScore = -1

  for (const option in scores) {
    if (scores[option] > maxScore) {
      maxScore = scores[option]
      winningOption = parseInt(option)
    }
  }

  await prisma.meetingSchedules.update({
    where: { id: meetingSchedulesId },
    data: {
      winningOption,
      finalScores: scores,
      status: 'completed',
    },
  })

  return { winningOption, scores }
}
