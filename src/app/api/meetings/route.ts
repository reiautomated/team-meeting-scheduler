import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { tallyVotes } from '@/lib/scheduling'
import { googleCalendarService } from '@/lib/google-calendar'
import { emailService } from '@/lib/email'
import { z } from 'zod'

const FinalizeRequestSchema = z.object({
  meetingSchedulesId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = FinalizeRequestSchema.parse(body)

    const result = await tallyVotes(validatedData.meetingSchedulesId)

    if (!result) {
      return NextResponse.json({ success: false, error: 'Vote tallying failed.' }, { status: 500 })
    }

    const meetingSchedules = await prisma.meetingSchedules.findUnique({
      where: { id: validatedData.meetingSchedulesId },
      include: { meetingSeries: { include: { teamMembers: { include: { user: true } } } } },
    })

    if (!meetingSchedules) {
      return NextResponse.json({ success: false, error: 'Meeting schedules not found.' }, { status: 404 })
    }

    const winningOption = `option${result.winningOption}` as 'option1' | 'option2' | 'option3'
    const winningSchedule = meetingSchedules[winningOption] as any

    if (!winningSchedule || !winningSchedule.meetings) {
      return NextResponse.json({ success: false, error: 'Winning schedule not found.' }, { status: 404 })
    }

    const attendees = meetingSchedules.meetingSeries.teamMembers.map(tm => ({
      email: tm.user.email,
      name: tm.user.name,
    }))

    const createdMeetings = []
    for (const meeting of winningSchedule.meetings) {
      const event = googleCalendarService.formatEventForCalendar(
        meeting.title,
        meetingSchedules.meetingSeries.description || '',
        new Date(meeting.startTime),
        new Date(meeting.endTime),
        attendees
      )
      const calendarEventId = await googleCalendarService.createEvent(event)

      const created = await prisma.meeting.create({
        data: {
          meetingSeriesId: meetingSchedules.meetingSeriesId,
          title: meeting.title,
          startTime: new Date(meeting.startTime),
          endTime: new Date(meeting.endTime),
          sequence: winningSchedule.meetings.indexOf(meeting) + 1,
          calendarEventId,
        },
      })
      createdMeetings.push(created)
    }

    await prisma.meetingSeries.update({
      where: { id: meetingSchedules.meetingSeriesId },
      data: { status: 'scheduled' },
    })

    // Send notification emails
    for (const tm of meetingSchedules.meetingSeries.teamMembers) {
      await emailService.sendMeetingScheduledNotification(
        tm.user.email,
        tm.user.name,
        meetingSchedules.meetingSeries.title,
        createdMeetings.map(m => ({
          title: m.title,
          startTime: m.startTime.toLocaleString(),
          endTime: m.endTime.toLocaleString(),
          timezone: tm.user.timezone,
        }))
      )
    }

    return NextResponse.json({ success: true, data: createdMeetings })
  } catch (error) {
    console.error('Error finalizing schedule:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to finalize schedule' },
      { status: 500 }
    )
  }
}
