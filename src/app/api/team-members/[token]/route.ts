import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const teamMember = await prisma.teamMember.findFirst({
      where: { 
        inviteToken: token
        // Allow both admin and member roles to access via token
      },
      include: {
        user: true,
        meetingSeries: {
          include: {
            admin: true
          }
        }
      }
    })

    if (!teamMember) {
      return NextResponse.json(
        { success: false, error: 'Invalid invite token' },
        { status: 404 }
      )
    }

    // Check if meeting series is still in collecting phase
    if (teamMember.meetingSeries.status !== 'collecting') {
      return NextResponse.json(
        { success: false, error: 'This meeting series is no longer accepting responses' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        teamMember: {
          id: teamMember.id,
          hasResponded: teamMember.hasResponded,
          user: {
            id: teamMember.user.id,
            email: teamMember.user.email,
            name: teamMember.user.name,
            timezone: teamMember.user.timezone
          }
        },
        meetingSeries: {
          id: teamMember.meetingSeries.id,
          title: teamMember.meetingSeries.title,
          description: teamMember.meetingSeries.description,
          status: teamMember.meetingSeries.status,
          dateRangeStart: teamMember.meetingSeries.dateRangeStart,
          dateRangeEnd: teamMember.meetingSeries.dateRangeEnd,
          meetingDuration: teamMember.meetingSeries.meetingDuration,
          numberOfMeetings: teamMember.meetingSeries.numberOfMeetings,
          consecutiveDays: teamMember.meetingSeries.consecutiveDays,
          admin: {
            name: teamMember.meetingSeries.admin.name,
            email: teamMember.meetingSeries.admin.email
          }
        }
      }
    })

  } catch (error) {
    console.error('Error fetching team member by token:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team member information' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const body = await request.json()

    const teamMember = await prisma.teamMember.findFirst({
      where: { 
        inviteToken: token
        // Allow both admin and member roles to access via token
      },
      include: {
        meetingSeries: true
      }
    })

    if (!teamMember) {
      return NextResponse.json(
        { success: false, error: 'Invalid invite token' },
        { status: 404 }
      )
    }

    // Check if meeting series is still in collecting phase
    if (teamMember.meetingSeries.status !== 'collecting') {
      return NextResponse.json(
        { success: false, error: 'This meeting series is no longer accepting updates' },
        { status: 400 }
      )
    }

    // Update user information if provided
    const updates: Record<string, unknown> = {}
    if (body.name) updates.name = body.name
    if (body.timezone) updates.timezone = body.timezone

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: teamMember.userId },
        data: updates
      })
    }

    // Get updated team member info
    const updatedTeamMember = await prisma.teamMember.findUnique({
      where: { id: teamMember.id },
      include: {
        user: true,
        meetingSeries: {
          include: {
            admin: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        teamMember: {
          id: updatedTeamMember!.id,
          hasResponded: updatedTeamMember!.hasResponded,
          user: {
            id: updatedTeamMember!.user.id,
            email: updatedTeamMember!.user.email,
            name: updatedTeamMember!.user.name,
            timezone: updatedTeamMember!.user.timezone
          }
        }
      }
    })

  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update team member information' },
      { status: 500 }
    )
  }
}