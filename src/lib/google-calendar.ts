import { google } from 'googleapis'
import { JWT } from 'google-auth-library'

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
  private auth: JWT

  constructor() {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\n/g, '\n')

    if (!serviceAccountEmail || !privateKey) {
      console.warn('Google Calendar service account credentials are not set. Calendar integration will be disabled.')
      this.auth = null as any
    } else {
      this.auth = new google.auth.JWT(
        serviceAccountEmail,
        undefined,
        privateKey,
        ['https://www.googleapis.com/auth/calendar']
      )
    }
  }

  async createEvent(eventData: CalendarEvent): Promise<string> {
    if (!this.auth) {
      console.log('Calendar integration disabled. Mocking event creation.')
      return 'mock-event-id-' + Date.now()
    }

    try {
      const response = await calendar.events.insert({
        auth: this.auth,
        calendarId: 'primary', // Or a specific calendar ID
        requestBody: eventData,
      })
      return response.data.id!
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw new Error('Failed to create calendar event')
    }
  }

  async updateEvent(eventId: string, eventData: Partial<CalendarEvent>): Promise<void> {
    if (!this.auth) return
    try {
      await calendar.events.update({
        auth: this.auth,
        calendarId: 'primary',
        eventId,
        requestBody: eventData,
      })
    } catch (error) {
      console.error('Error updating calendar event:', error)
      throw new Error('Failed to update calendar event')
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.auth) return
    try {
      await calendar.events.delete({
        auth: this.auth,
        calendarId: 'primary',
        eventId,
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
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 10 },
        ],
      }
    }
  }
}

export const googleCalendarService = new GoogleCalendarService()
