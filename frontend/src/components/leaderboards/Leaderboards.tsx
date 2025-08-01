import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'

interface LeaderboardEntry {
  user_id: number
  adventurer_name: string
  level: number
  xp: number
  rank: number
}

interface Leaderboard {
  entries: LeaderboardEntry[]
  timeframe: string
}

const Leaderboards = () => {
  const { token } = useAuthStore()
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null)
  const [timeframe, setTimeframe] = useState('weekly')
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchLeaderboard()
  }, [timeframe])

  const fetchLeaderboard = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const timeframes = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-questify-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-3xl font-fantasy text-questify-400 mb-2">
          Leaderboards
        </h2>
        <p className="text-gray-400">See how you rank among other adventurers</p>
      </motion.div>

      {/* Timeframe Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center space-x-2"
      >
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeframe === tf.value
                ? 'bg-questify-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </motion.div>

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        {leaderboard && leaderboard.entries.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.entries.map((entry, index) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-yellow-600/20 border border-yellow-500' :
                  index === 1 ? 'bg-gray-400/20 border border-gray-400' :
                  index === 2 ? 'bg-orange-600/20 border border-orange-500' :
                  'bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-white">{entry.adventurer_name}</div>
                    <div className="text-sm text-gray-400">Level {entry.level}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-questify-400">{entry.xp}</div>
                  <div className="text-sm text-gray-400">XP</div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No leaderboard data available</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Leaderboards 