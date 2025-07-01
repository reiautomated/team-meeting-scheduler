'use client'

import { useState } from 'react'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

const DateRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  reasoning: z.string()
})

export default function AdminSetup() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    adminEmail: '',
    adminName: '',
    adminTimezone: '',
    teamEmails: '',
    dateRangeStart: '',
    dateRangeEnd: '',
    aiSuggestion: ''
  })
  const [loading, setLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<{startDate: string, endDate: string, reasoning: string} | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const getAiDateSuggestion = async () => {
    setLoading(true)
    try {
      const { object } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: DateRangeSchema,
        prompt: `You are helping schedule quarterly team meetings. Based on the following information, suggest an optimal date range for scheduling 3 consecutive days of 3.5-hour meetings:

Meeting Title: ${formData.title}
Description: ${formData.description}
Current Date: ${new Date().toISOString().split('T')[0]}
Admin Timezone: ${formData.adminTimezone}

Consider:
- Avoiding major holidays
- Quarterly spacing (every 3 months)
- Business days preferred
- 2-3 week notice period for team coordination

Provide a 2-3 week window where the meetings could be scheduled, starting about 3-4 weeks from now.`
      })
      
      setAiSuggestion(object)
      setFormData({
        ...formData,
        dateRangeStart: object.startDate,
        dateRangeEnd: object.endDate,
        aiSuggestion: object.reasoning
      })
    } catch (error) {
      console.error('AI suggestion failed:', error)
      // Fallback to mock suggestion if AI fails
      const mockSuggestion = {
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reasoning: "AI service temporarily unavailable. Please manually select your preferred date range for the meetings."
      }
      
      setAiSuggestion(mockSuggestion)
      setFormData({
        ...formData,
        dateRangeStart: mockSuggestion.startDate,
        dateRangeEnd: mockSuggestion.endDate,
        aiSuggestion: mockSuggestion.reasoning
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/meeting-series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminTimezone: formData.adminTimezone,
          dateRangeStart: formData.dateRangeStart,
          dateRangeEnd: formData.dateRangeEnd,
          teamEmails: formData.teamEmails,
          meetingDuration: 210, // 3.5 hours
          numberOfMeetings: 3,
          consecutiveDays: true
        })
      })

      const result = await response.json()

      if (result.success) {
        alert(`Meeting series "${formData.title}" created successfully! Team members will receive email invitations to select their availability.`)
        // Reset form
        setFormData({
          title: '',
          description: '',
          adminEmail: '',
          adminName: '',
          adminTimezone: '',
          teamEmails: '',
          dateRangeStart: '',
          dateRangeEnd: '',
          aiSuggestion: ''
        })
        setStep(1)
        setAiSuggestion(null)
      } else {
        alert(`Error creating meeting series: ${result.error}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to create meeting series. Please try again.')
    }
    
    setLoading(false)
  }

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'Pacific/Auckland'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Meeting Series</h1>
          
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {i}
                  </div>
                  {i < 3 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step > i ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-800">
              <span>Basic Info</span>
              <span>Date Range</span>
              <span>Team Members</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Meeting Series Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Q1 2024 Quarterly Review"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Three consecutive days of strategic planning and team alignment sessions"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Your Timezone
                  </label>
                  <select
                    name="adminTimezone"
                    value={formData.adminTimezone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    required
                  >
                    <option value="">Select your timezone</option>
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next: Set Date Range
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-blue-950 mb-2">Date Range Selection</h3>
                  <p className="text-blue-900">
                    Choose a date range when your team meetings could be scheduled. Team members will select their availability within this range, and AI will analyze all responses to suggest optimal meeting times.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Date Range Start
                    </label>
                    <input
                      type="date"
                      name="dateRangeStart"
                      value={formData.dateRangeStart}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Date Range End
                    </label>
                    <input
                      type="date"
                      name="dateRangeEnd"
                      value={formData.dateRangeEnd}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getAiDateSuggestion}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Getting Suggestion...' : 'Get AI Date Suggestion'}
                </button>

                {aiSuggestion && (
                  <div className="bg-indigo-50 p-4 rounded-md">
                    <h4 className="font-medium text-indigo-950 mb-2">AI Suggestion</h4>
                    <p className="text-indigo-900 text-sm">{aiSuggestion.reasoning}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Next: Add Team
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-2">
                    Team Member Emails
                  </label>
                  <textarea
                    name="teamEmails"
                    value={formData.teamEmails}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                    placeholder="Enter team member emails (one per line):
john@company.com
sarah@company.com
mike@company.com"
                    required
                  />
                  <p className="text-sm text-gray-800 mt-1">
                    Each team member will receive an email invitation to select their availability.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-md">
                  <h4 className="font-medium text-yellow-950 mb-2">Meeting Details Summary</h4>
                  <ul className="text-yellow-900 space-y-1 text-sm">
                    <li>• 3 meetings, each 3.5 hours long</li>
                    <li>• Preferably on consecutive days</li>
                    <li>• Google Calendar events will be created automatically</li>
                    <li>• Reminders set for 24h, 3h, 1h, and 10min before each meeting</li>
                  </ul>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating...' : 'Create Meeting Series'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}