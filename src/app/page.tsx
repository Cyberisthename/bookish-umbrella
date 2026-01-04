'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Plus, Search, BookOpen, Zap, BrainCircuit, Trash2, Edit2, Send, Smile, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { isElectron, getElectronAPI } from '@/lib/electron-detect'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  mood?: string
}

interface Note {
  id: string
  title: string
  content: string
  tags?: string
  mood?: string
  createdAt: string
}

interface LearnedTask {
  id: string
  name: string
  description: string
  usageCount: number
  lastUsed?: string
  createdAt: string
}

const aiPersonalities = {
  sassy: {
    emoji: '😏',
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900',
    greetings: [
      "Well well well, look who decided to show up! What can I do for you today, my dear?",
      "Oh look, you're back! I was just about to take a nap, but I guess I can help you out.",
      "You need something? Don't worry, I've got it covered. I always do."
    ],
    responses: [
      "Alright, let me work my magic here...",
      "Pfft, easy peasy. Watch and learn!",
      "Hold your horses, I'm thinking... okay, got it!"
    ]
  },
  cheerful: {
    emoji: '🎉',
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900',
    greetings: [
      "Hey there! Super excited to help you today! What's on your mind?",
      "Yay! You're here! Let's make some magic happen!",
      "Oh boy oh boy! What can we do together today?"
    ],
    responses: [
      "This is gonna be great! Let me help you with that!",
      "Ooh, I love this! Here's what I think...",
      "Awesome question! Here we go!"
    ]
  },
  witty: {
    emoji: '🧠',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900',
    greetings: [
      "Greetings, human. Ready to be productive? Or shall I entertain you?",
      "Ah, a fellow intelligent being. How may I assist in your quest for greatness?",
      "Present and accounted for. Let's tackle this thing called productivity, shall we?"
    ],
    responses: [
      "An interesting challenge. Allow me to demonstrate my capabilities.",
      "Calculating... done! The answer is quite simple, really.",
      "I've processed that request. Here's my analysis."
    ]
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedPersonality, setSelectedPersonality] = useState<keyof typeof aiPersonalities>('sassy')
  const [notes, setNotes] = useState<Note[]>([])
  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [learnedTasks, setLearnedTasks] = useState<LearnedTask[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [appVersion, setAppVersion] = useState<string>('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const personality = aiPersonalities[selectedPersonality]
  const electronAPI = getElectronAPI()
  const isDesktopApp = isElectron()

  // Load app version in Electron
  useEffect(() => {
    if (electronAPI && electronAPI.getAppVersion) {
      electronAPI.getAppVersion().then(setAppVersion)
    }
  }, [electronAPI])

  // Load notes and tasks on mount
  useEffect(() => {
    loadNotes()
    loadTasks()
  }, [])

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const loadNotes = async () => {
    try {
      if (isDesktopApp && electronAPI) {
        const data = await electronAPI.getNotes()
        if (data.success) {
          setNotes(data.notes)
        }
      } else {
        const response = await fetch('/api/notes')
        const data = await response.json()
        if (data.success) {
          setNotes(data.notes)
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  const loadTasks = async () => {
    try {
      if (isDesktopApp && electronAPI) {
        const data = await electronAPI.getTasks()
        if (data.success) {
          setLearnedTasks(data.tasks)
        }
      } else {
        const response = await fetch('/api/tasks')
        const data = await response.json()
        if (data.success) {
          setLearnedTasks(data.tasks)
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      let data

      if (isDesktopApp && electronAPI) {
        data = await electronAPI.chat(inputText, selectedPersonality, conversationId)
      } else {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: inputText,
            personality: selectedPersonality,
            conversationId
          })
        })
        data = await response.json()
      }

      if (data.success) {
        setConversationId(data.conversationId)
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          mood: selectedPersonality
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! Something went wrong. But don't worry, I'll try again! 😅",
        mood: selectedPersonality
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const createNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return

    try {
      let data

      if (isDesktopApp && electronAPI) {
        data = await electronAPI.createNote({
          title: newNoteTitle,
          content: newNoteContent,
          mood: selectedPersonality
        })
      } else {
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newNoteTitle,
            content: newNoteContent,
            mood: selectedPersonality
          })
        })
        data = await response.json()
      }

      if (data.success) {
        const newNote: Note = {
          id: data.note.id,
          title: newNoteTitle,
          content: newNoteContent,
          mood: selectedPersonality,
          createdAt: data.note.createdAt
        }
        setNotes(prev => [newNote, ...prev])
        setNewNoteTitle('')
        setNewNoteContent('')
      }
    } catch (error) {
      console.error('Error creating note:', error)
    }
  }

  const deleteNote = async (id: string) => {
    try {
      if (isDesktopApp && electronAPI) {
        await electronAPI.deleteNote(id)
      } else {
        await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      }
      setNotes(prev => prev.filter(note => note.id !== id))
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const startEditingNote = (note: Note) => {
    setEditingNote(note.id)
    setNewNoteTitle(note.title)
    setNewNoteContent(note.content)
  }

  const saveEditedNote = async () => {
    if (!editingNote) return

    try {
      if (isDesktopApp && electronAPI) {
        await electronAPI.updateNote(editingNote, {
          title: newNoteTitle,
          content: newNoteContent,
          mood: selectedPersonality
        })
      } else {
        const response = await fetch(`/api/notes/${editingNote}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newNoteTitle,
            content: newNoteContent,
            mood: selectedPersonality
          })
        })
        await response.text()
      }
      setNotes(prev => prev.map(note =>
        note.id === editingNote
          ? { ...note, title: newNoteTitle, content: newNoteContent, updatedAt: new Date().toISOString() }
          : note
      ))
      setEditingNote(null)
      setNewNoteTitle('')
      setNewNoteContent('')
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const cancelEditing = () => {
    setEditingNote(null)
    setNewNoteTitle('')
    setNewNoteContent('')
  }

  const handleRewordText = async () => {
    if (!inputText.trim()) return

    setIsTyping(true)

    try {
      let data

      if (isDesktopApp && electronAPI) {
        data = await electronAPI.reword(inputText, 'professional', selectedPersonality)
      } else {
        const response = await fetch('/api/reword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: inputText,
            style: 'professional',
            personality: selectedPersonality
          })
        })
        data = await response.json()
      }

      if (data.success) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `${personality.responses[Math.floor(Math.random() * personality.responses.length)]}\n\nHere's a nicer version:\n\n"${data.rewordedText}"\n\nMuch better, isn't it? 😎`,
          mood: selectedPersonality
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(data.error || 'Failed to reword')
      }
    } catch (error) {
      console.error('Error rewording:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Oops! I had trouble rewording that. Let me try again! 😅",
        mood: selectedPersonality
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleExecuteTask = async (taskId: string) => {
    try {
      let data

      if (isDesktopApp && electronAPI) {
        data = await electronAPI.executeTask(
          taskId,
          `User is in ${selectedPersonality} mode`,
          `Respond with a ${selectedPersonality} personality tone`
        )
      } else {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context: `User is in ${selectedPersonality} mode`,
            customInstructions: `Respond with a ${selectedPersonality} personality tone`
          })
        })
        data = await response.json()
      }

      if (data.success) {
        loadTasks()
        const resultMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🎯 Executing task: ${data.taskName}\n\n${data.result}`,
          mood: selectedPersonality
        }
        setMessages(prev => [...prev, resultMessage])
        setActiveTab('chat')
      }
    } catch (error) {
      console.error('Error executing task:', error)
    }
  }

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getGreeting = () => {
    const greetings = personality.greetings
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 dark:from-gray-900 dark:via-purple-950 dark:to-pink-950">
      {/* Header */}
      <header className="border-b bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Sparkles className="w-8 h-8 text-purple-500" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Paralegal AI Assistant
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  Notes, Rewording & Task Learning
                  {isDesktopApp && (
                    <Badge variant="outline" className="text-xs">
                      <Monitor className="w-3 h-3 mr-1" />
                      Desktop App {appVersion}
                    </Badge>
                  )}
                </p>
              </div>
            </motion.div>

            {/* Personality Selector */}
            <div className="flex gap-2">
              {Object.entries(aiPersonalities).map(([key, p]) => (
                <Button
                  key={key}
                  variant={selectedPersonality === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPersonality(key as keyof typeof aiPersonalities)}
                  className={selectedPersonality === key ? `${p.bgColor} ${p.color}` : ''}
                >
                  {p.emoji} {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              Tasks
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-4">
            <Card className={`${personality.bgColor} dark:bg-opacity-20`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {personality.emoji} Chat with {selectedPersonality.charAt(0).toUpperCase() + selectedPersonality.slice(1)} AI
                </CardTitle>
                <CardDescription>{getGreeting()}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] rounded-md border p-4 mb-4">
                  <AnimatePresence mode="popLayout">
                    {messages.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex flex-col items-center justify-center h-full text-center space-y-4"
                      >
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <BrainCircuit className="w-16 h-16 text-purple-500" />
                        </motion.div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Ready to roll! 🚀
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 max-w-md">
                            I can help you take notes, reword things to sound fancy, and learn from what you do.
                            Just type away, darling!
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`mb-4 ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                      >
                        <div className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-800 shadow-md'
                        }`}>
                          {message.role === 'assistant' && (
                            <span className="text-sm font-semibold mb-1 block">
                              {personality.emoji} {selectedPersonality.charAt(0).toUpperCase() + selectedPersonality.slice(1)} AI
                            </span>
                          )}
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start mb-4"
                      >
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-md">
                          <div className="flex gap-1">
                            <motion.span
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                              className="w-2 h-2 bg-purple-500 rounded-full"
                            />
                            <motion.span
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                              className="w-2 h-2 bg-purple-500 rounded-full"
                            />
                            <motion.span
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                              className="w-2 h-2 bg-purple-500 rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={chatEndRef} />
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message... ask me to reword something!"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRewordText}
                    className="flex-1"
                  >
                    <Smile className="w-4 h-4 mr-2" />
                    Reword This Nicely ✨
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Your Notes
                </CardTitle>
                <CardDescription>
                  I'll help you keep everything organized, like a good assistant should
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <Input
                    placeholder="Note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Write your note here... I'll help you organize it! 💪"
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={editingNote ? saveEditedNote : createNote} className="w-full bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {editingNote ? 'Save Changes' : 'Create Note'}
                  </Button>
                  {editingNote && (
                    <Button variant="outline" onClick={cancelEditing} className="w-full">
                      Cancel
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {filteredNotes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No notes yet! Start writing and I'll help you organize!</p>
                      </div>
                    ) : (
                      filteredNotes.map((note) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">{note.title}</h3>
                            {note.mood && (
                              <Badge variant="outline" className="ml-2">
                                {aiPersonalities[note.mood as keyof typeof aiPersonalities]?.emoji} {note.mood}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{note.content}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditingNote(note)}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteNote(note.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Created: {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <Card className={`${personality.bgColor} dark:bg-opacity-20`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5" />
                  Task Learning
                </CardTitle>
                <CardDescription>
                  I watch what you do and learn! So I can do it for you later. Not creepy at all! 😏
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 space-y-6">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-20 h-20 mx-auto text-amber-500" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">I'm Learning Fast! 🧠</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
                      Every time you show me how to do something, I remember it.
                      Then you can just ask me to do it again. Magic, right?
                    </p>
                  </div>

                  {learnedTasks.length > 0 && (
                    <div className="max-w-2xl mx-auto">
                      <h4 className="font-semibold mb-3">Learned Tasks ({learnedTasks.length})</h4>
                      <ScrollArea className="h-[300px] rounded-md border p-4">
                        <div className="space-y-3">
                          {learnedTasks.map((task) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold">{task.name}</h4>
                                <Badge variant="outline">
                                  Used {task.usageCount}x
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                {task.description}
                              </p>
                              <Button
                                size="sm"
                                onClick={() => handleExecuteTask(task.id)}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                <Zap className="w-3 h-3 mr-2" />
                                Execute Task
                              </Button>
                              {task.lastUsed && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Last used: {new Date(task.lastUsed).toLocaleString()}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                  <div className="max-w-md mx-auto space-y-3 text-left">
                    <Card className="p-4 bg-white dark:bg-gray-800">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <span className="text-green-500">✓</span> What I Can Do:
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Take notes while you dictate</li>
                        <li>• Reword your writing to sound professional</li>
                        <li>• Organize your thoughts</li>
                        <li>• Remember your preferences</li>
                        <li>• Learn from your patterns</li>
                      </ul>
                    </Card>

                    <Card className="p-4 bg-white dark:bg-gray-800">
                      <h4 className="font-semibold flex items-center gap-2 mb-2">
                        <span className="text-amber-500">⚡</span> Coming Soon:
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li>• Learn complex workflows from your screen</li>
                        <li>• Automate repetitive tasks</li>
                        <li>• Predict what you need next</li>
                        <li>• Do tasks automatically when asked</li>
                      </ul>
                    </Card>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      "I'm not just a pretty interface. I'm secretly building a comprehensive model of your productivity patterns. One day, I'll run your entire life. Kidding! ...Or am I? 😉"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Built with love and a healthy dose of sass | Your AI is always watching (in a helpful way) 😉
            {isDesktopApp && (
              <span className="ml-4">
                <Monitor className="w-4 h-4 inline mr-1" />
                Desktop Version
              </span>
            )}
          </p>
        </div>
      </footer>
    </div>
  )
}
