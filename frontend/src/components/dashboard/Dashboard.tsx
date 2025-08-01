import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import Button from '../common/Button'
import QuestCard from './QuestCard'
import OracleChat from './OracleChat'

interface Quest {
  id: number
  title: string
  description: string
  xp_value: number
  is_completed: boolean
  created_at: string
  completed_at?: string
}

const Dashboard = () => {
  const { user, token } = useAuthStore()
  const [quests, setQuests] = useState<Quest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showOracle, setShowOracle] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/quests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuests(data)
      }
    } catch (error) {
      console.error('Error fetching quests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestComplete = async (questId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/quests/${questId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        // Refresh quests and user data
        await fetchQuests()
        // You might want to refresh user data here as well
      }
    } catch (error) {
      console.error('Error completing quest:', error)
    }
  }

  const activeQuests = quests.filter(quest => !quest.is_completed)
  const completedQuests = quests.filter(quest => quest.is_completed)

  return (
    <div className="space-y-6">
      {/* User Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-fantasy text-questify-400">
              Welcome, {user?.adventurer_name}!
            </h2>
            <p className="text-gray-400">Level {user?.level} Adventurer</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-questify-400">{user?.xp}</div>
            <div className="text-sm text-gray-400">XP</div>
          </div>
        </div>
        
        {/* XP Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progress to Level {user ? user.level + 1 : 1}</span>
            <span>{user?.xp}/{user?.xp_for_next_level} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              className="bg-questify-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: user ? `${(user.xp / user.xp_for_next_level) * 100}%` : '0%' 
              }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Oracle Chat Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <Button
          onClick={() => setShowOracle(!showOracle)}
          size="lg"
          className="px-8"
        >
          {showOracle ? 'Hide Oracle' : '🔮 Speak with The Oracle'}
        </Button>
      </motion.div>

      {/* Oracle Chat */}
      <AnimatePresence>
        {showOracle && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <OracleChat onQuestCreated={fetchQuests} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Quests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-fantasy text-questify-400 mb-4">
          Active Quests ({activeQuests.length})
        </h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : activeQuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeQuests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={() => handleQuestComplete(quest.id)}
              />
            ))}
          </div>
        ) : (
          <div className="card text-center py-8">
            <p className="text-gray-400 mb-4">No active quests</p>
            <p className="text-sm text-gray-500">
              Speak with The Oracle to get your first quest!
            </p>
          </div>
        )}
      </motion.div>

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-fantasy text-questify-400 mb-4">
            Completed Quests ({completedQuests.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedQuests.slice(0, 6).map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={() => {}}
                isCompleted
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard 