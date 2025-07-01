'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface MeetingSeries {
  id: string
  title: string
  description: string
  status: string
  admin: {
    name: string
    email: string
  }
  teamMembers: Array<{
    id: string
    hasResponded: boolean
    role: string
    user: {
      name: string
      email: string
    }
  }>
  availabilities: Array<{
    startTime: string
    endTime: string
    user: {
      name: string
    }
  }>
  _count: {
    availabilities: number
  }
}

interface ScheduleOption {
  meetingTimes: Array<{
    date: string
    startTime: string
    endTime: string
    dayOfWeek: string
  }>
  reasoning: string
  score: number
}

interface MeetingSchedules {
  id: string
  option1: ScheduleOption
  option2: ScheduleOption
  option3: ScheduleOption
  status: string
  winningOption?: number
  finalScores?: { [key: string]: number }
  votes: Array<{
    teamMember: {
      user: {
        name: string
        email: string
      }
    }
    firstChoice: number
    secondChoice: number
    thirdChoice: number
  }>
}

export default function AdminDashboard() {
  const [meetingSeries, setMeetingSeries] = useState<MeetingSeries[]>([])
  const [schedules, setSchedules] = useState<{ [key: string]: MeetingSchedules }>({})
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string>('')

  useEffect(() => {
    loadMeetingSeries()
  }, [])

  const loadMeetingSeries = async () => {
    try {
      const response = await fetch('/api/meeting-series')
      const result = await response.json()
      
      if (result.success) {
        setMeetingSeries(result.data)
        
        // Load schedules for each series
        for (const series of result.data) {
          if (series.status === 'analyzing' || series.status === 'scheduled') {
            const schedulesResponse = await fetch(`/api/meeting-schedules?meetingSeriesId=${series.id}`)
            const schedulesResult = await schedulesResponse.json()
            
            if (schedulesResult.success) {
              setSchedules(prev => ({
                ...prev,
                [series.id]: schedulesResult.data
              }))
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading meeting series:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSchedules = async (seriesId: string) => {
    setGenerating(seriesId)
    
    try {
      const response = await fetch('/api/meeting-schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingSeriesId: seriesId
        })
      })

      const result = await response.json()

      if (result.success) {
        alert('AI has generated 3 optimal meeting schedule options! Team members can now vote.')
        loadMeetingSeries()
      } else {
        alert(`Error generating schedules: ${result.error}`)
      }
    } catch (error) {
      console.error('Error generating schedules:', error)
      alert('Failed to generate schedules. Please try again.')
    } finally {
      setGenerating('')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'setup': return 'bg-gray-100 text-gray-800'
      case 'collecting': return 'bg-blue-100 text-blue-800'
      case 'analyzing': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'setup': return 'Setting Up'
      case 'collecting': return 'Collecting Availability'
      case 'analyzing': return 'AI Analysis & Voting'
      case 'scheduled': return 'Scheduled'
      default: return status
    }
  }

  const formatMeetingTime = (meeting: { date: string, startTime: string, endTime: string, dayOfWeek: string }) => {
    const date = new Date(meeting.date)
    return `${meeting.dayOfWeek}, ${format(date, 'MMM d')} at ${meeting.startTime} - ${meeting.endTime}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your team meeting schedules</p>
        </div>

        <div className="space-y-8">
          {meetingSeries.map((series) => {
            const totalMembers = series.teamMembers.filter(tm => tm.role === 'member').length
            const respondedMembers = series.teamMembers.filter(tm => tm.hasResponded && tm.role === 'member').length
            const responseRate = totalMembers > 0 ? Math.round((respondedMembers / totalMembers) * 100) : 0
            const schedule = schedules[series.id]

            return (
              <div key={series.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{series.title}</h2>
                    <p className="text-gray-600">{series.description}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(series.status)}`}>
                      {getStatusText(series.status)}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Team Response Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-800">Response Rate:</span>
                        <span className="font-medium text-blue-900">{responseRate}% ({respondedMembers}/{totalMembers})</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${responseRate}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-blue-700">
                        {series._count.availabilities} availability slots submitted
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Team Members</h3>
                    <div className="space-y-1">
                      {series.teamMembers.filter(tm => tm.role === 'member').map((member) => (
                        <div key={member.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{member.user.name}</span>
                          <span className={member.hasResponded ? 'text-green-600' : 'text-red-600'}>
                            {member.hasResponded ? '✓ Responded' : '⏳ Pending'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* AI Schedule Generation */}
                {series.status === 'collecting' && responseRate >= 70 && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-6">
                    <h3 className="font-semibold text-purple-900 mb-2">🤖 Ready for AI Analysis</h3>
                    <p className="text-purple-800 mb-4">
                      {responseRate}% of team members have responded. AI can now analyze availability and generate optimal meeting schedule options for team voting.
                    </p>
                    <button
                      onClick={() => generateSchedules(series.id)}
                      disabled={generating === series.id}
                      className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating === series.id ? 'Generating Schedules...' : 'Generate AI Schedule Options'}
                    </button>
                  </div>
                )}

                {/* Schedule Options & Voting Results */}
                {schedule && (
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-4">
                      🗳️ Schedule Options & Voting
                      {schedule.status === 'completed' && schedule.winningOption && (
                        <span className="ml-2 text-sm bg-green-200 text-green-800 px-2 py-1 rounded">
                          Winner: Option {schedule.winningOption}
                        </span>
                      )}
                    </h3>

                    <div className="grid gap-4">
                      {[1, 2, 3].map((optionNum) => {
                        const option = schedule[`option${optionNum}` as keyof typeof schedule] as ScheduleOption
                        const isWinner = schedule.winningOption === optionNum
                        const voteCount = schedule.votes.filter(vote => 
                          vote.firstChoice === optionNum || vote.secondChoice === optionNum || vote.thirdChoice === optionNum
                        ).length
                        const score = schedule.finalScores?.[optionNum] || 0

                        return (
                          <div key={optionNum} className={`border rounded-lg p-4 ${isWinner ? 'border-green-500 bg-green-100' : 'border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-semibold text-gray-900">
                                Option {optionNum} {isWinner && '🏆'}
                                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  AI Score: {option.score}/10
                                </span>
                              </h4>
                              {schedule.status === 'completed' && (
                                <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                  Final Score: {score} points
                                </span>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Meeting Times:</div>
                                {option.meetingTimes.map((meeting, idx) => (
                                  <div key={idx} className="text-sm text-gray-600 bg-white p-2 rounded">
                                    📅 {formatMeetingTime(meeting)}
                                  </div>
                                ))}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700 mb-1">Reasoning:</div>
                                <p className="text-sm text-gray-600">{option.reasoning}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {schedule.status === 'voting' && (
                      <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                        <p className="text-yellow-800">
                          <strong>Voting in progress:</strong> {schedule.votes.length}/{totalMembers} team members have voted
                        </p>
                      </div>
                    )}

                    {schedule.status === 'completed' && (
                      <div className="mt-4 p-4 bg-green-100 rounded-lg">
                        <p className="text-green-800">
                          <strong>Voting complete!</strong> All team members have voted. Option {schedule.winningOption} has been selected as the final schedule.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {meetingSeries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No meeting series found.</p>
            <a 
              href="/admin/setup" 
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Create New Meeting Series
            </a>
          </div>
        )}
      </div>
    </div>
  )
}