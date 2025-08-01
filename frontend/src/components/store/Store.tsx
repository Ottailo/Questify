import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import Button from '../common/Button'

interface StoreItem {
  id: string
  name: string
  description: string
  price: number
  type: 'cosmetic' | 'hero_pass'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  image?: string
}

interface HeroPass {
  id: number
  user_id: number
  season_id: number
  xp_progress: number
  premium_track_unlocked: boolean
  created_at: string
}

const Store = () => {
  const { token } = useAuthStore()
  const [heroPass, setHeroPass] = useState<HeroPass | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'store' | 'hero_pass'>('store')

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Mock store items
  const storeItems: StoreItem[] = [
    {
      id: '1',
      name: 'Golden Armor Set',
      description: 'Shimmering golden armor that makes you stand out',
      price: 500,
      type: 'cosmetic',
      rarity: 'legendary'
    },
    {
      id: '2',
      name: 'Mystic Staff',
      description: 'A staff that glows with ancient magic',
      price: 300,
      type: 'cosmetic',
      rarity: 'epic'
    },
    {
      id: '3',
      name: 'Shadow Cloak',
      description: 'A cloak that makes you blend into the shadows',
      price: 200,
      type: 'cosmetic',
      rarity: 'rare'
    },
    {
      id: '4',
      name: 'Crystal Sword',
      description: 'A sword forged from pure crystal',
      price: 400,
      type: 'cosmetic',
      rarity: 'epic'
    }
  ]

  useEffect(() => {
    fetchHeroPass()
  }, [])

  const fetchHeroPass = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hero-pass`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setHeroPass(data)
      }
    } catch (error) {
      console.error('Error fetching hero pass:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const purchaseItem = async (item: StoreItem) => {
    // This would be implemented with a real payment system
    alert(`Purchase ${item.name} for ${item.price} coins?`)
  }

  const unlockHeroPass = async () => {
    // This would unlock the premium track
    alert('Unlock Hero Pass Premium Track?')
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

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
          Store & Hero Pass
        </h2>
        <p className="text-gray-400">Unlock cosmetics and premium content</p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center space-x-2"
      >
        <button
          onClick={() => setActiveTab('store')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'store'
              ? 'bg-questify-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🛒 Store
        </button>
        <button
          onClick={() => setActiveTab('hero_pass')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'hero_pass'
              ? 'bg-questify-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          ⭐ Hero Pass
        </button>
      </motion.div>

      {/* Store Tab */}
      {activeTab === 'store' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storeItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="card"
              >
                <div className="w-full h-32 bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">⚔️</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <span className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                      {item.rarity.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400">{item.description}</p>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-questify-400 font-bold">{item.price} coins</span>
                    <Button
                      onClick={() => purchaseItem(item)}
                      size="sm"
                    >
                      Purchase
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hero Pass Tab */}
      {activeTab === 'hero_pass' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Hero Pass Info */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-fantasy text-questify-400">Season 1 Hero Pass</h3>
                <p className="text-gray-400">Unlock exclusive rewards and cosmetics</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-questify-400">
                  {heroPass?.xp_progress || 0}
                </div>
                <div className="text-sm text-gray-400">XP Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-1">
                <span>Progress</span>
                <span>{heroPass?.xp_progress || 0}/1000 XP</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <motion.div
                  className="bg-questify-500 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${((heroPass?.xp_progress || 0) / 1000) * 100}%` 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Hero Pass Status */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Status: {heroPass?.premium_track_unlocked ? 'Premium' : 'Free'}
              </div>
              {!heroPass?.premium_track_unlocked && (
                <Button
                  onClick={unlockHeroPass}
                  size="md"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Unlock Premium
                </Button>
              )}
            </div>
          </div>

          {/* Reward Tracks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Free Track */}
            <div className="card">
              <h4 className="text-lg font-medium text-white mb-4">Free Track</h4>
              <div className="space-y-3">
                {[1, 5, 10, 15, 20].map((level) => (
                  <div key={level} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Level {level}</div>
                      <div className="text-sm text-gray-400">Free Reward</div>
                    </div>
                    <div className="text-questify-400">✓</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Track */}
            <div className="card border-2 border-purple-500">
              <h4 className="text-lg font-medium text-purple-400 mb-4">Premium Track</h4>
              <div className="space-y-3">
                {[1, 5, 10, 15, 20].map((level) => (
                  <div key={level} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div>
                      <div className="font-medium text-white">Level {level}</div>
                      <div className="text-sm text-purple-400">Premium Reward</div>
                    </div>
                    <div className="text-purple-400">⭐</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Store 