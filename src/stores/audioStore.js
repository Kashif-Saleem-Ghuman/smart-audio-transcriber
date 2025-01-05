import { defineStore } from 'pinia'
import { uploadClient, apiClient } from '@/api/axios'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    audioFiles: [],
    chatHistory: [
      // add dummy chat
      {
        id: '1',
        title: 'Chat 1',
        transcriptionIds: ['1', '2'],
        messages: [],
        createdAt: new Date(),
        status: 'completed'
      },
      {
        id: '2',
        title: 'Chat 2',
        transcriptionIds: ['3', '4'],
        messages: [],
        createdAt: new Date(),
        status: 'completed'
      }
    ], // Array of chat sessions
    activeChat: null // Current active chat session
  }),

  actions: {
    // State management actions
    async addAudio(audioFiles, source) {
        console.log("Adding audio files:", audioFiles);
        audioFiles.forEach(file => {
            this.audioFiles.push({
                id: `audio-${Math.random().toString(36).substr(2, 9)}`,
                title: file.name,
                source: source, // 'upload' or 'youtube'
                createdAt: new Date(),
                status: 'ready', // ready, transcribing, completed, error
                transcription: null,
            });
        });
    },

    updateAudioStatus(audioId, status) {
      const audio = this.audioFiles.find(a => a.id === audioId);
      if (audio) {
        audio.status = status;
      }
    },

    setTranscription(audioId, transcription) {
      const audio = this.audioFiles.find(a => a.id === audioId);
      if (audio) {
        audio.transcription = transcription;
        audio.status = 'completed';
      }
    },

    // API actions
    uploadAudio(url, files) {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })
      return uploadClient.post(url, formData, {
        timeout: 30000,
        responseType: 'json'
      })
    },

    getAudioFiles(url) {
      return apiClient.get(url)
    },

    getAudioDetails(url) {
      return apiClient.get(url)
    },

    async transcribeAudios(audioIds, language) {
      return apiClient.post('/transcribe', {
        audioIds,
        language
      })
    },

    modifyTranscription(url, prompt) {
      return apiClient.post(url, { prompt })
    },

    deleteAudio(url) {
      return apiClient.delete(url)
    },

    // Chat related actions
    createNewChat(transcriptionIds) {
      const chatId = `chat-${Math.random().toString(36).substr(2, 9)}`
      const newChat = {
        id: chatId,
        title: `Chat ${this.chatHistory.length + 1}`,
        transcriptionIds,
        messages: [],
        createdAt: new Date()
      }
      this.chatHistory.push(newChat)
      this.activeChat = chatId
      return chatId
    },

    addMessageToChat(chatId, message) {
      const chat = this.chatHistory.find(c => c.id === chatId)
      if (chat) {
        chat.messages.push({
          id: `msg-${Math.random().toString(36).substr(2, 9)}`,
          content: message.content,
          role: message.role, // 'user' or 'assistant'
          timestamp: new Date()
        })
      }
    },

    setActiveChat(chatId) {
      this.activeChat = chatId
    },

    async sendPrompt(prompt, transcriptionIds) {
      // TODO: Implement API call
      return apiClient.post('/process-transcription', {
        prompt,
        transcriptionIds
      })
    }
  },

  getters: {
    getReadyAudios: (state) => {
      return state.audioFiles.filter(audio => audio.status === 'ready');
    },

    getCompletedAudios: (state) => {
      return state.audioFiles.filter(audio => audio.status === 'completed')
    },

    getCurrentChat: (state) => {
      return state.chatHistory.find(chat => chat.id === state.activeChat)
    },

    getChatTranscriptions: (state) => (chatId) => {
      const chat = state.chatHistory.find(c => c.id === chatId)
      if (!chat) return []
      return state.audioFiles.filter(audio => 
        chat.transcriptionIds.includes(audio.id) && 
        audio.transcription
      )
    }
  },
}) 