import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const VoteSchema = z.object({
  token: z.string(),
  firstChoice: z.number(),
  secondChoice: z.number(),
  thirdChoice: z.number(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = VoteSchema.parse(body)

    const teamMember = await prisma.teamMember.findUnique({
      where: { inviteToken: validatedData.token },
      include: { meetingSeries: { include: { meetingSchedules: true } } },
    })

    if (!teamMember || !teamMember.meetingSeries.meetingSchedules) {
      return NextResponse.json({ success: false, error: 'Invalid token or no schedules found' }, { status: 404 })
    }

    await prisma.scheduleVote.create({
      data: {
        teamMemberId: teamMember.id,
        meetingSchedulesId: teamMember.meetingSeries.meetingSchedules.id,
        firstChoice: validatedData.firstChoice,
        secondChoice: validatedData.secondChoice,
        thirdChoice: validatedData.thirdChoice,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting vote:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}
