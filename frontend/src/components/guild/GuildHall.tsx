import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import Button from '../common/Button'

interface Guild {
  id: number
  name: string
  description: string
  leader_id: number
  created_at: string
}

interface GuildMember {
  id: number
  user_id: number
  guild_id: number
  role: string
  joined_at: string
  user: {
    adventurer_name: string
    level: number
  }
}

interface GuildQuest {
  id: number
  guild_id: number
  title: string
  description: string
  target_value: number
  current_value: number
  is_completed: boolean
  created_at: string
  completed_at?: string
}

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
}

const GuildHall = () => {
  const { token, user } = useAuthStore()
  const [guild, setGuild] = useState<Guild | null>(null)
  const [members, setMembers] = useState<GuildMember[]>([])
  const [quests, setQuests] = useState<GuildQuest[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchGuildData()
    setupWebSocket()
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchGuildData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/guilds/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const guildData = await response.json()
        setGuild(guildData)
        // Fetch members and quests for this guild
        await Promise.all([
          fetchGuildMembers(guildData.id),
          fetchGuildQuests(guildData.id)
        ])
      }
    } catch (error) {
      console.error('Error fetching guild data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchGuildMembers = async (guildId: number) => {
    // This would need to be implemented in the backend
    // For now, we'll use mock data
    setMembers([
      {
        id: 1,
        user_id: user?.id || 1,
        guild_id: guildId,
        role: 'leader',
        joined_at: new Date().toISOString(),
        user: {
          adventurer_name: user?.adventurer_name || 'You',
          level: user?.level || 1
        }
      }
    ])
  }

  const fetchGuildQuests = async (guildId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/guilds/${guildId}/quests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const questsData = await response.json()
        setQuests(questsData)
      }
    } catch (error) {
      console.error('Error fetching guild quests:', error)
    }
  }

  const setupWebSocket = () => {
    const wsUrl = API_BASE_URL.replace('http', 'ws') + '/ws/guild-chat'
    const websocket = new WebSocket(wsUrl)
    
    websocket.onopen = () => {
      console.log('Connected to guild chat')
    }
    
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        user: data.user || 'Unknown',
        message: data.message,
        timestamp: new Date()
      }])
    }
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
    
    setWs(websocket)
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !ws) return

    const messageData = {
      user: user?.adventurer_name,
      message: newMessage,
      timestamp: new Date().toISOString()
    }

    ws.send(JSON.stringify(messageData))
    setNewMessage('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-questify-500"></div>
      </div>
    )
  }

  if (!guild) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-fantasy text-questify-400 mb-4">
          No Guild Found
        </h2>
        <p className="text-gray-400 mb-6">
          You are not currently a member of any guild.
        </p>
        <Button size="lg">
          Create Guild
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Guild Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-fantasy text-questify-400">{guild.name}</h2>
            <p className="text-gray-400 mt-1">{guild.description}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-questify-400">{members.length}</div>
            <div className="text-sm text-gray-400">Members</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guild Members */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-xl font-fantasy text-questify-400 mb-4">Members</h3>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-white">{member.user.adventurer_name}</div>
                  <div className="text-sm text-gray-400">Level {member.user.level}</div>
                </div>
                <div className="text-xs px-2 py-1 bg-questify-600 text-white rounded">
                  {member.role}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Guild Quests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-xl font-fantasy text-questify-400 mb-4">Guild Quests</h3>
          <div className="space-y-3">
            {quests.length > 0 ? (
              quests.map((quest) => (
                <div key={quest.id} className="p-3 bg-gray-700 rounded-lg">
                  <div className="font-medium text-white">{quest.title}</div>
                  <div className="text-sm text-gray-400 mb-2">{quest.description}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      {quest.current_value}/{quest.target_value}
                    </div>
                    <div className="text-xs px-2 py-1 bg-green-600 text-white rounded">
                      {quest.is_completed ? 'Completed' : 'Active'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No active guild quests</p>
            )}
          </div>
        </motion.div>

        {/* Guild Chat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-xl font-fantasy text-questify-400 mb-4">Guild Chat</h3>
          
          {/* Messages */}
          <div className="h-64 overflow-y-auto mb-4 space-y-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="p-2 bg-gray-700 rounded">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-questify-400 text-sm">{msg.user}</span>
                  <span className="text-xs text-gray-400">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-200 mt-1">{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="input-field flex-1"
            />
            <Button onClick={sendMessage} size="sm">
              Send
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default GuildHall 