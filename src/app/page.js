'use client'

import { useState, useEffect, useRef } from 'react'
import { FaMicrophone, FaBars } from 'react-icons/fa'
import { IoMdClose } from 'react-icons/io'
import { FiSend } from 'react-icons/fi'

export default function Home() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState('light')

  const messagesEndRef = useRef(null)

  const handleSend = async () => {
    if (message.trim()) {
      setError('')
      setMessages((prev) => [...prev, { sender: 'user', content: message }])
      const currentMessage = message
      setMessage('')

      try {
        setIsTyping(true)
        const response = await fetch('/api/groq', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: currentMessage }),
        })

        const data = await response.json()

        if (!response.ok) throw new Error(data.details || data.error || 'Failed to get response')

        const aiResponse = data.response
        if (!aiResponse) throw new Error('No response content from API')

        setMessages((prev) => [...prev, { sender: 'ai', content: aiResponse }])
        setIsTyping(false)
      } catch (err) {
        setError(err.message)
        setMessages((prev) => [...prev, { sender: 'error', content: `Error: ${err.message}` }])
        setIsTyping(false)
      }
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  const startVoiceInput = () => {
    const recognition = new window.webkitSpeechRecognition()
    recognition.lang = 'en-US'
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setMessage(transcript)
    }
    recognition.start()
  }

  return (
    <div className={`${theme} min-h-screen flex flex-col bg-gray-100 dark:bg-gray-700`}>
      {/* Navigation */}
      <nav className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-800/30 backdrop-blur-lg">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <FaBars className="text-lg sm:text-xl" />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              KAVI AI
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a className="text-sm font-medium hover:text-blue-400 transition-colors cursor-pointer relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a className="text-sm font-medium text-gray-400 hover:text-blue-400 transition-colors cursor-pointer relative group">
              History (coming soon)
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-200 group-hover:w-full"></span>
            </a>
            <a className="text-sm font-medium hover:text-blue-400 transition-colors cursor-pointer relative group">
              Settings
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-200 group-hover:w-full"></span>
            </a>
          </div>

          <button
            onClick={toggleTheme}
            className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-xs sm:text-sm font-medium whitespace-nowrap"
          >
            {theme === 'light' ? 'Dark' : 'Light'} Mode
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleSidebar}>
          <div
            className="fixed top-0 left-0 h-full w-[250px] sm:w-64 bg-gradient-to-b from-gray-900 to-gray-800 p-4 sm:p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                KAVI AI
              </h2>
              <button
                onClick={toggleSidebar}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                aria-label="Close menu"
              >
                <IoMdClose className="text-lg sm:text-xl" />
              </button>
            </div>

            <nav className="space-y-3 sm:space-y-4">
              <a className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors hover:bg-white/10 cursor-pointer text-white">
                <span className="text-sm font-medium">Home</span>
              </a>
              <a className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors hover:bg-white/10 cursor-pointer text-gray-300">
                <span className="text-sm font-medium">History (coming soon)</span>
              </a>
              <a className="flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-colors hover:bg-white/10 cursor-pointer text-white">
                <span className="text-sm font-medium">Settings</span>
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900">
        <div className="flex-1 p-2 sm:p-4 overflow-y-auto bg-white dark:bg-gray-800">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 sm:p-3 md:p-4 text-xs sm:text-sm md:text-base rounded-lg max-w-[85%] sm:max-w-[75%] break-words whitespace-pre-wrap transform transition-all duration-300 ease-in-out ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-auto animate-slideUp'
                    : msg.sender === 'ai'
                    ? 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-black dark:text-white mr-auto animate-fadeIn'
                    : 'bg-red-100 text-red-800 dark:bg-red-400 dark:text-white'
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div
                className={`typing-dots flex items-center gap-1 ${
                  messages[messages.length - 1]?.sender === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-2 sm:p-4 border-t border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
          <div className="flex items-center space-x-2">
            <button
              onClick={startVoiceInput}
              className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 transition-transform"
              aria-label="Voice input"
            >
              <FaMicrophone />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition-all"
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:scale-105 transition-transform"
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in;
        }

        .typing-dots .dot {
          width: 8px;
          height: 8px;
          background-color: #999;
          border-radius: 50%;
          animation: typing 1s infinite;
        }

        .typing-dots .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
