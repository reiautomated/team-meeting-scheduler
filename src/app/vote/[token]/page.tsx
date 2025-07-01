'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import VoteForm from './components/vote-form'

export default function VotePage() {
  const params = useParams()
  const token = params.token as string

  const [meetingSchedules, setMeetingSchedules] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      const fetchSchedules = async () => {
        try {
          const response = await fetch(`/api/meeting-schedules?token=${token}`)
          const result = await response.json()

          if (result.success) {
            setMeetingSchedules(result.data)
          } else {
            setError(result.error)
          }
        } catch (err) {
          setError('Failed to fetch schedules.')
        } finally {
          setLoading(false)
        }
      }
      fetchSchedules()
    }
  }, [token])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading schedules...</div>
  }

  if (error) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vote on Meeting Times</h1>
          <p className="text-gray-600 mb-8">
            Please review the proposed schedules and vote for your preferred options.
          </p>

          {meetingSchedules ? (
            <VoteForm meetingSchedules={meetingSchedules} token={token} />
          ) : (
            <p>No schedules available for voting at this time.</p>
          )}
        </div>
      </div>
    </div>
  )
}
