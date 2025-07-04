'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

import AvailabilityCalendar from './components/availability-calendar'

export default function AvailabilityPage() {
  const params = useParams()
  const token = params.token as string

  const [meetingSeries, setMeetingSeries] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      const fetchMeetingSeries = async () => {
        try {
          const response = await fetch(`/api/team-members/${token}`)
          const result = await response.json()

          if (result.success) {
            setMeetingSeries(result.data.meetingSeries)
          } else {
            setError(result.error)
          }
        } catch (err) {
          setError('Failed to fetch meeting details.')
        } finally {
          setLoading(false)
        }
      }
      fetchMeetingSeries()
    }
  }, [token])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>
  }

  if (meetingSeries && meetingSeries.status !== 'collecting') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Submissions Closed</h1>
          <p className="text-gray-600">
            This meeting series is no longer accepting new availability submissions. It is currently in the '{meetingSeries.status}' phase.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{meetingSeries.title}</h1>
          <p className="text-gray-800 mb-6">{meetingSeries.description}</p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-8">
            <h2 className="font-bold text-blue-950">Instructions</h2>
            <p className="text-blue-900">
              Please select your available time slots between{' '}
              <strong>{new Date(meetingSeries.dateRangeStart).toLocaleDateString()}</strong> and{' '}
              <strong>{new Date(meetingSeries.dateRangeEnd).toLocaleDateString()}</strong>.
              The meeting will be {meetingSeries.meetingDuration / 60} hours long.
            </p>
          </div>

          <AvailabilityCalendar
            dateRangeStart={meetingSeries.dateRangeStart}
            dateRangeEnd={meetingSeries.dateRangeEnd}
            meetingDuration={meetingSeries.meetingDuration}
          />

        </div>
      </div>
    </div>
  )
}
