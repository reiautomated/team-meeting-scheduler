import { google } from 'googleapis'

const calendar = google.calendar('v3')

export interface CalendarEvent {
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees: Array<{
    email: string
    displayName?: string
  }>
  reminders: {
    useDefault: boolean
    overrides?: Array<{
      method: 'email' | 'popup'
      minutes: number
    }>
  }
}

class GoogleCalendarService {
  private auth: any

  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uris: [process.env.GOOGLE_REDIRECT_URI]
      },
      scopes: ['https://www.googleapis.com/auth/calendar']
    })
  }

  async createEvent(eventData: CalendarEvent): Promise<string> {
    try {
      const authClient = await this.auth.getClient()
      
      const event = {
        summary: eventData.summary,
        description: eventData.description,
        start: eventData.start,
        end: eventData.end,
        attendees: eventData.attendees,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email' as const, minutes: 24 * 60 }, // 24 hours
            { method: 'popup' as const, minutes: 3 * 60 },  // 3 hours
            { method: 'popup' as const, minutes: 60 },      // 1 hour
            { method: 'popup' as const, minutes: 10 }       // 10 minutes
          ]
        },
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: true
      }

      const response = await calendar.events.insert({
        auth: authClient,
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all'
      })

      return response.data.id || ''
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw new Error('Failed to create calendar event')
    }
  }

  async updateEvent(eventId: string, eventData: Partial<CalendarEvent>): Promise<void> {
    try {
      const authClient = await this.auth.getClient()
      
      await calendar.events.update({
        auth: authClient,
        calendarId: 'primary',
        eventId: eventId,
        requestBody: eventData,
        sendUpdates: 'all'
      })
    } catch (error) {
      console.error('Error updating calendar event:', error)
      throw new Error('Failed to update calendar event')
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      const authClient = await this.auth.getClient()
      
      await calendar.events.delete({
        auth: authClient,
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      })
    } catch (error) {
      console.error('Error deleting calendar event:', error)
      throw new Error('Failed to delete calendar event')
    }
  }

  formatEventForCalendar(
    title: string,
    description: string,
    startTime: Date,
    endTime: Date,
    attendees: Array<{ email: string; name?: string }>,
    timezone: string = 'UTC'
  ): CalendarEvent {
    return {
      summary: title,
      description: description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: timezone
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: timezone
      },
      attendees: attendees.map(attendee => ({
        email: attendee.email,
        displayName: attendee.name
      })),
      reminders: {
        useDefault: false
      }
    }
  }
}

export const googleCalendarService = new GoogleCalendarService()