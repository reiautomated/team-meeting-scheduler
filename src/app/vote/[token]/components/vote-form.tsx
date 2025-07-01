'use client'

import { useState } from 'react'

interface VoteFormProps {
  meetingSchedules: any
  token: string
}

export default function VoteForm({ meetingSchedules, token }: VoteFormProps) {
  const [firstChoice, setFirstChoice] = useState<number | null>(null)
  const [secondChoice, setSecondChoice] = useState<number | null>(null)
  const [thirdChoice, setThirdChoice] = useState<number | null>(null)

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          firstChoice,
          secondChoice,
          thirdChoice,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Vote submitted successfully!')
      } else {
        alert(`Error submitting vote: ${result.error}`)
      }
    } catch (error) {
      console.error('Error submitting vote:', error)
      alert('Failed to submit vote. Please try again.')
    }
  }

  const options = [
    { id: 1, schedule: meetingSchedules.option1 },
    { id: 2, schedule: meetingSchedules.option2 },
    { id: 3, schedule: meetingSchedules.option3 },
  ].filter(option => option.schedule && option.schedule.meetings.length > 0)

  return (
    <div>
      <div className="space-y-6">
        {options.map(option => (
          <div key={option.id} className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg text-gray-800">Option {option.id}</h3>
            <p className="text-sm text-gray-600 mb-3">{option.schedule.reasoning}</p>
            <ul className="space-y-2">
              {option.schedule.meetings.map((meeting: any, index: number) => (
                <li key={index} className="text-sm text-gray-700">
                  <strong>Meeting {index + 1}:</strong>{' '}
                  {new Date(meeting.startTime).toLocaleString()} - {new Date(meeting.endTime).toLocaleString()}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Choice</label>
          <select
            onChange={e => setFirstChoice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option>Select...</option>
            {options.map(o => <option key={o.id} value={o.id}>Option {o.id}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Second Choice</label>
          <select
            onChange={e => setSecondChoice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option>Select...</option>
            {options.map(o => <option key={o.id} value={o.id}>Option {o.id}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Third Choice</label>
          <select
            onChange={e => setThirdChoice(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option>Select...</option>
            {options.map(o => <option key={o.id} value={o.id}>Option {o.id}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={handleSubmit}
          disabled={!firstChoice || !secondChoice || !thirdChoice}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Submit Vote
        </button>
      </div>
    </div>
  )
}
