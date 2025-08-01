import { motion } from 'framer-motion'
import Button from '../common/Button'

interface Quest {
  id: number
  title: string
  description: string
  xp_value: number
  is_completed: boolean
  created_at: string
  completed_at?: string
}

interface QuestCardProps {
  quest: Quest
  onComplete: () => void
  isCompleted?: boolean
}

const QuestCard = ({ quest, onComplete, isCompleted = false }: QuestCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className={`card ${isCompleted ? 'opacity-75' : ''}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-lg font-medium text-white">{quest.title}</h4>
        <div className="flex items-center space-x-2">
          <span className="text-questify-400 font-bold">{quest.xp_value}</span>
          <span className="text-xs text-gray-400">XP</span>
        </div>
      </div>

      {quest.description && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {quest.description}
        </p>
      )}

      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-400">
          Created: {formatDate(quest.created_at)}
        </div>

        {isCompleted ? (
          <div className="flex items-center space-x-2">
            <span className="text-green-400 text-sm">✓ Completed</span>
            {quest.completed_at && (
              <span className="text-xs text-gray-400">
                {formatDate(quest.completed_at)}
              </span>
            )}
          </div>
        ) : (
          <Button
            onClick={onComplete}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            Complete Quest
          </Button>
        )}
      </div>
    </motion.div>
  )
}

export default QuestCard 