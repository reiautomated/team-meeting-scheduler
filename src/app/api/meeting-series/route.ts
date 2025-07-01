import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { emailService } from '@/lib/email'
import { z } from 'zod'

const CreateMeetingSeriesSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  adminName: z.string().min(1),
  adminEmail: z.string().email(),
  adminTimezone: z.string().min(1),
  dateRangeStart: z.string(),
  dateRangeEnd: z.string(),
  teamEmails: z.string(),
  meetingDuration: z.number().default(210), // 3.5 hours in minutes
  numberOfMeetings: z.number().default(3),
  consecutiveDays: z.boolean().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateMeetingSeriesSchema.parse(body)

    // Create or find admin user
    const adminUser = await prisma.user.upsert({
      where: { email: validatedData.adminEmail },
      update: {
        name: validatedData.adminName,
        timezone: validatedData.adminTimezone
      },
      create: {
        email: validatedData.adminEmail,
        name: validatedData.adminName,
        timezone: validatedData.adminTimezone
      }
    })

    // Create meeting series
    const meetingSeries = await prisma.meetingSeries.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        adminId: adminUser.id,
        dateRangeStart: new Date(validatedData.dateRangeStart),
        dateRangeEnd: new Date(validatedData.dateRangeEnd),
        meetingDuration: validatedData.meetingDuration,
        numberOfMeetings: validatedData.numberOfMeetings,
        consecutiveDays: validatedData.consecutiveDays,
        status: 'collecting'
      }
    })

    // Add admin as team member with admin role
    await prisma.teamMember.create({
      data: {
        userId: adminUser.id,
        meetingSeriesId: meetingSeries.id,
        role: 'admin',
        hasResponded: true
      }
    })

    // Parse team member emails and create team members
    const emailList = validatedData.teamEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0 && email !== validatedData.adminEmail)

    for (const email of emailList) {
      if (email) {
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: email.split('@')[0],
            timezone: 'UTC'
          }
        })

        const inviteToken = generateInviteToken()
        await prisma.teamMember.create({
          data: {
            userId: user.id,
            meetingSeriesId: meetingSeries.id,
            role: 'member',
            inviteToken,
            hasResponded: false
          }
        })

        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.BASE_URL
        const availabilityUrl = `${baseUrl}/availability/${inviteToken}`
        await emailService.sendAvailabilityRequest(
          user.email,
          user.name,
          meetingSeries.title,
          { 
            start: new Date(validatedData.dateRangeStart).toLocaleDateString(),
            end: new Date(validatedData.dateRangeEnd).toLocaleDateString()
          },
          availabilityUrl
        )
      }
    }

    const fullMeetingSeries = await prisma.meetingSeries.findUnique({
      where: { id: meetingSeries.id },
      include: {
        admin: true,
        teamMembers: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: fullMeetingSeries
    })

  } catch (error) {
    console.error('Error creating meeting series:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create meeting series' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const adminEmail = searchParams.get('adminEmail')

    let whereClause = {}
    if (adminEmail) {
      whereClause = {
        admin: {
          email: adminEmail
        }
      }
    }

    const meetingSeries = await prisma.meetingSeries.findMany({
      where: whereClause,
      include: {
        admin: true,
        teamMembers: {
          include: {
            user: true
          }
        },
        meetings: true,
        _count: {
          select: {
            availabilities: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: meetingSeries
    })

  } catch (error) {
    console.error('Error fetching meeting series:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch meeting series' },
      { status: 500 }
    )
  }
}

function generateInviteToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
