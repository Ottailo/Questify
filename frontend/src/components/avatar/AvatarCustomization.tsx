import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../stores/authStore'
import Button from '../common/Button'

interface Avatar {
  id: number
  user_id: number
  head_style: string
  body_style: string
  hair_color: string
  skin_tone: string
}

const AvatarCustomization = () => {
  const { token } = useAuthStore()
  const [avatar, setAvatar] = useState<Avatar | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const customizationOptions = {
    headStyles: ['default', 'warrior', 'mage', 'rogue', 'knight'],
    bodyStyles: ['default', 'armored', 'robed', 'leather', 'plate'],
    hairColors: ['brown', 'black', 'blonde', 'red', 'white', 'blue'],
    skinTones: ['light', 'medium', 'dark', 'tan', 'pale']
  }

  const [selectedOptions, setSelectedOptions] = useState({
    head_style: 'default',
    body_style: 'default',
    hair_color: 'brown',
    skin_tone: 'medium'
  })

  useEffect(() => {
    fetchAvatar()
  }, [])

  const fetchAvatar = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/avatar`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setAvatar(data)
        setSelectedOptions({
          head_style: data.head_style,
          body_style: data.body_style,
          hair_color: data.hair_color,
          skin_tone: data.skin_tone
        })
      }
    } catch (error) {
      console.error('Error fetching avatar:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveAvatar = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(selectedOptions),
      })
      
      if (response.ok) {
        const data = await response.json()
        setAvatar(data)
      }
    } catch (error) {
      console.error('Error saving avatar:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleOptionChange = (category: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [category]: value
    }))
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
          Avatar Customization
        </h2>
        <p className="text-gray-400">Customize your adventurer's appearance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avatar Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-xl font-fantasy text-questify-400 mb-4">Preview</h3>
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-gray-700 rounded-lg flex items-center justify-center border-2 border-gray-600">
              <div className="text-center">
                <div className="text-6xl mb-2">👤</div>
                <div className="text-sm text-gray-400">
                  {selectedOptions.head_style} • {selectedOptions.body_style}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedOptions.hair_color} hair • {selectedOptions.skin_tone} skin
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Customization Options */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Head Style */}
          <div className="card">
            <h4 className="text-lg font-medium text-white mb-3">Head Style</h4>
            <div className="grid grid-cols-3 gap-2">
              {customizationOptions.headStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => handleOptionChange('head_style', style)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedOptions.head_style === style
                      ? 'border-questify-500 bg-questify-600 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Body Style */}
          <div className="card">
            <h4 className="text-lg font-medium text-white mb-3">Body Style</h4>
            <div className="grid grid-cols-3 gap-2">
              {customizationOptions.bodyStyles.map((style) => (
                <button
                  key={style}
                  onClick={() => handleOptionChange('body_style', style)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedOptions.body_style === style
                      ? 'border-questify-500 bg-questify-600 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Color */}
          <div className="card">
            <h4 className="text-lg font-medium text-white mb-3">Hair Color</h4>
            <div className="grid grid-cols-3 gap-2">
              {customizationOptions.hairColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleOptionChange('hair_color', color)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedOptions.hair_color === color
                      ? 'border-questify-500 bg-questify-600 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone */}
          <div className="card">
            <h4 className="text-lg font-medium text-white mb-3">Skin Tone</h4>
            <div className="grid grid-cols-3 gap-2">
              {customizationOptions.skinTones.map((tone) => (
                <button
                  key={tone}
                  onClick={() => handleOptionChange('skin_tone', tone)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedOptions.skin_tone === tone
                      ? 'border-questify-500 bg-questify-600 text-white'
                      : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={saveAvatar}
            disabled={isSaving}
            size="lg"
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Avatar'}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default AvatarCustomization 