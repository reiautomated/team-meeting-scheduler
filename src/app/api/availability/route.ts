import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const AvailabilitySchema = z.object({
  token: z.string(),
  timeSlots: z.array(
    z.object({
      day: z.string().datetime(),
      time: z.string(), // e.g., "09:00-12:30"
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = AvailabilitySchema.parse(body)

    const teamMember = await prisma.teamMember.findUnique({
      where: { inviteToken: validatedData.token },
      include: { user: true, meetingSeries: true },
    })

    if (!teamMember) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 })
    }

    const availabilities = validatedData.timeSlots.map(slot => {
      const [startTime, endTime] = slot.time.split('-')
      const [startHour, startMinute] = startTime.split(':').map(Number)
      const [endHour, endMinute] = endTime.split(':').map(Number)

      const startDate = new Date(slot.day)
      startDate.setHours(startHour, startMinute, 0, 0)

      const endDate = new Date(slot.day)
      endDate.setHours(endHour, endMinute, 0, 0)

      return {
        userId: teamMember.userId,
        meetingSeriesId: teamMember.meetingSeriesId,
        startTime: startDate,
        endTime: endDate,
        timezone: teamMember.user.timezone,
      }
    })

    await prisma.availability.createMany({
      data: availabilities,
    })

    await prisma.teamMember.update({
      where: { id: teamMember.id },
      data: { hasResponded: true },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting availability:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to submit availability' },
      { status: 500 }
    )
  }
}
