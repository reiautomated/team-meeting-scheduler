import sgMail from '@sendgrid/mail'

interface EmailConfig {
  to: string
  from: string
  subject: string
  html: string
}

class EmailService {
  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    } else {
      console.warn('SENDGRID_API_KEY is not set. Email sending will be disabled.')
    }
  }

  async sendEmail({ to, from, subject, html }: EmailConfig): Promise<void> {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('Email sending disabled. Mocking email send.')
      return
    }

    try {
      await sgMail.send({ to, from, subject, html })
    } catch (error) {
      console.error('Error sending email with SendGrid:', error)
      throw new Error('Failed to send email')
    }
  }

  generateAvailabilityRequestEmail(
    recipientName: string,
    meetingTitle: string,
    dateRange: { start: string; end: string },
    availabilityUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meeting Availability Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .details { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Meeting Availability Request</h1>
          </div>
          
          <div class="content">
            <p>Hi ${recipientName},</p>
            
            <p>You've been invited to participate in <strong>${meetingTitle}</strong>. We need to coordinate schedules across multiple time zones to find the best meeting times for everyone.</p>
            
            <div class="details">
              <h3>Meeting Details:</h3>
              <ul>
                <li><strong>Meeting Series:</strong> ${meetingTitle}</li>
                <li><strong>Number of Meetings:</strong> 3 sessions</li>
                <li><strong>Duration:</strong> 3.5 hours each</li>
                <li><strong>Scheduling Window:</strong> ${dateRange.start} to ${dateRange.end}</li>
                <li><strong>Format:</strong> Preferably on consecutive days</li>
              </ul>
            </div>
            
            <p>Please click the button below to select your available time slots. The system will automatically handle timezone conversions and find optimal meeting times that work for the entire team.</p>
            
            <div style="text-align: center;">
              <a href="${availabilityUrl}" class="button">Select Your Availability</a>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>Select multiple time slots to increase scheduling flexibility</li>
              <li>Times will be displayed in your local timezone</li>
              <li>Once everyone submits their availability, you'll receive calendar invitations</li>
              <li>Calendar events will include automatic reminders (24h, 3h, 1h, and 10min before)</li>
            </ul>
            
            <p>If you have any questions or need assistance, please reply to this email.</p>
            
            <p>Thank you for your participation!</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by Team Meeting Scheduler</p>
            <p>If you can't click the button above, copy and paste this link: ${availabilityUrl}</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  generateMeetingScheduledEmail(
    recipientName: string,
    meetingTitle: string,
    meetings: Array<{
      title: string
      startTime: string
      endTime: string
      timezone: string
    }>
  ): string {
    const meetingsList = meetings
      .map((meeting) => `
        <li>
          <strong>${meeting.title}</strong><br>
          ${meeting.startTime} - ${meeting.endTime} (${meeting.timezone})
        </li>
      `)
      .join('')

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meetings Scheduled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .meetings { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Meetings Successfully Scheduled!</h1>
          </div>
          
          <div class="content">
            <p>Hi ${recipientName},</p>
            
            <p>Great news! We've successfully scheduled your <strong>${meetingTitle}</strong> meetings. Calendar invitations have been sent to your email and should appear in your calendar shortly.</p>
            
            <div class="meetings">
              <h3>Scheduled Meetings:</h3>
              <ul>
                ${meetingsList}
              </ul>
            </div>
            
            <p><strong>What to expect:</strong></p>
            <ul>
              <li>Google Calendar invitations have been sent to all participants</li>
              <li>You'll receive automatic reminders: 24 hours, 3 hours, 1 hour, and 10 minutes before each meeting</li>
              <li>All attendees can see each other in the guest list</li>
              <li>Meeting details include timezone information for clarity</li>
            </ul>
            
            <p>If you need to make any changes or have scheduling conflicts, please contact the meeting organizer as soon as possible.</p>
            
            <p>We look forward to productive meetings with the team!</p>
          </div>
          
          <div class="footer">
            <p>This email was sent by Team Meeting Scheduler</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  async sendAvailabilityRequest(
    to: string,
    recipientName: string,
    meetingTitle: string,
    dateRange: { start: string; end: string },
    availabilityUrl: string
  ): Promise<void> {
    const html = this.generateAvailabilityRequestEmail(
      recipientName,
      meetingTitle,
      dateRange,
      availabilityUrl
    )

    await this.sendEmail({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `Availability Request: ${meetingTitle}`,
      html
    })
  }

  async sendMeetingScheduledNotification(
    to: string,
    recipientName: string,
    meetingTitle: string,
    meetings: Array<{
      title: string
      startTime: string
      endTime: string
      timezone: string
    }>
  ): Promise<void> {
    const html = this.generateMeetingScheduledEmail(
      recipientName,
      meetingTitle,
      meetings
    )

    await this.sendEmail({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `Meetings Scheduled: ${meetingTitle}`,
      html
    })
  }
}

export const emailService = new EmailService()
