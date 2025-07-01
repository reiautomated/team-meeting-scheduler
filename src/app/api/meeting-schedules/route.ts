import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateMeetingSchedules } from '@/lib/scheduling'
import { z } from 'zod'

const ScheduleRequestSchema = z.object({
  meetingSeriesId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = ScheduleRequestSchema.parse(body)

    const schedules = await generateMeetingSchedules(validatedData.meetingSeriesId)

    const meetingSchedules = await prisma.meetingSchedules.create({
      data: {
        meetingSeriesId: validatedData.meetingSeriesId,
        option1: schedules.option1 as any,
        option2: schedules.option2 as any,
        option3: schedules.option3 as any,
      },
    })

    return NextResponse.json({ success: true, data: meetingSchedules })
  } catch (error) {
    console.error('Error generating schedules:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to generate schedules' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 })
    }

    const teamMember = await prisma.teamMember.findUnique({
      where: { inviteToken: token },
      include: { meetingSeries: { include: { meetingSchedules: true } } },
    })

    if (!teamMember) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: teamMember.meetingSeries.meetingSchedules })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedules' },
      { status: 500 }
    )
  }
}
