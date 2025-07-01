import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const UpdateMeetingSeriesSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['setup', 'collecting', 'scheduled', 'completed']).optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const meetingSeries = await prisma.meetingSeries.findUnique({
      where: { id },
      include: {
        admin: true,
        teamMembers: {
          include: {
            user: true
          }
        },
        meetings: true,
        availabilities: {
          include: {
            user: true
          }
        }
      }
    })

    if (!meetingSeries) {
      return NextResponse.json(
        { success: false, error: 'Meeting series not found' },
        { status: 404 }
      )
    }

    // Calculate response statistics
    const totalMembers = meetingSeries.teamMembers.filter(tm => tm.role === 'member').length
    const respondedMembers = meetingSeries.teamMembers.filter(tm => tm.hasResponded && tm.role === 'member').length
    const responseRate = totalMembers > 0 ? (respondedMembers / totalMembers) * 100 : 0

    return NextResponse.json({
      success: true,
      data: {
        ...meetingSeries,
        stats: {
          totalMembers,
          respondedMembers,
          responseRate: Math.round(responseRate),
          totalAvailabilities: meetingSeries.availabilities.length
        }
      }
    })

  } catch (error) {
    console.error('Error fetching meeting series:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meeting series' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = UpdateMeetingSeriesSchema.parse(body)

    const meetingSeries = await prisma.meetingSeries.findUnique({
      where: { id }
    })

    if (!meetingSeries) {
      return NextResponse.json(
        { success: false, error: 'Meeting series not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {}
    if (validatedData.title) updateData.title = validatedData.title
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.status) updateData.status = validatedData.status
    if (validatedData.dateRangeStart) updateData.dateRangeStart = new Date(validatedData.dateRangeStart)
    if (validatedData.dateRangeEnd) updateData.dateRangeEnd = new Date(validatedData.dateRangeEnd)

    const updatedMeetingSeries = await prisma.meetingSeries.update({
      where: { id },
      data: updateData,
      include: {
        admin: true,
        teamMembers: {
          include: {
            user: true
          }
        },
        meetings: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedMeetingSeries
    })

  } catch (error) {
    console.error('Error updating meeting series:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update meeting series' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const meetingSeries = await prisma.meetingSeries.findUnique({
      where: { id }
    })

    if (!meetingSeries) {
      return NextResponse.json(
        { success: false, error: 'Meeting series not found' },
        { status: 404 }
      )
    }

    // Delete related records in correct order due to foreign key constraints
    await prisma.availability.deleteMany({
      where: { meetingSeriesId: id }
    })

    await prisma.meeting.deleteMany({
      where: { meetingSeriesId: id }
    })

    await prisma.teamMember.deleteMany({
      where: { meetingSeriesId: id }
    })

    await prisma.meetingSeries.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Meeting series deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting meeting series:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete meeting series' },
      { status: 500 }
    )
  }
}