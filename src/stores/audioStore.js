import { defineStore } from 'pinia'
import { uploadClient, apiClient } from '@/api/axios'
// import axios from 'axios'

/**
 * @typedef {Object} ChatMessage
 * @property {string} id - Unique identifier for the message
 * @property {string} content - Message content
 * @property {string} role - Role of the sender ('user' or 'assistant')
 * @property {Date} timestamp - When the message was sent
 */

/**
 * @typedef {Object} ChatSession
 * @property {string} id - Unique identifier for the chat
 * @property {string} title - Chat title
 * @property {string[]} transcriptionIds - IDs of associated transcriptions
 * @property {ChatMessage[]} messages - Array of chat messages
 * @property {Date} createdAt - When the chat was created
 * @property {string} status - Current status of the chat
 */

/**
 * @typedef {Object} AudioFile
 * @property {string} id - Unique identifier for the audio file
 * @property {string} title - File name/title
 * @property {string} source - Source of the audio ('upload' or 'youtube')
 * @property {Date} createdAt - When the file was added
 * @property {string} status - Current status of the file
 * @property {Object|null} transcription - Transcription data if available
 */

/**
 * Store for managing audio files and chat functionality
 */
export const useAudioStore = defineStore('audio', {
  state: () => ({
    /** @type {AudioFile[]} */
    audioFiles: [],
    /** @type {ChatSession[]} */
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
    /** @type {string|null} */
    activeChat: null // Current active chat session
  }),

  actions: {
    /**
     * Adds new audio files to the store
     * @param {File[]} audioFiles - Array of audio files to add
     * @param {string} source - Source of the files ('upload' or 'youtube')
     * @param {Object} [config={}] - Optional configuration for upload
     */
    async addAudio(audioFiles, source, config = {}) {
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
    // async addAudio(files, source, config = {}) {
    //   try {
    //     // Simulate file upload with progress
    //     for (const file of files) {
    //       // Create FormData
    //       const formData = new FormData();
    //       formData.append('file', file);

    //       // Make API call with progress tracking
    //       await axios.post('/api/upload', formData, {
    //         ...config,
    //         headers: {
    //           'Content-Type': 'multipart/form-data'
    //         }
    //       });
    //     }
    //   } catch (error) {
    //     console.error('Upload failed:', error);
    //     throw error;
    //   }
    // },

    /**
     * Updates the status of an audio file
     * @param {string} audioId - ID of the audio file
     * @param {string} status - New status to set
     */
    updateAudioStatus(audioId, status) {
      const audio = this.audioFiles.find(a => a.id === audioId);
      if (audio) {
        audio.status = status;
      }
    },

    /**
     * Sets transcription data for an audio file
     * @param {string} audioId - ID of the audio file
     * @param {Object} transcription - Transcription data
     */
    setTranscription(audioId, transcription) {
      const audio = this.audioFiles.find(a => a.id === audioId);
      if (audio) {
        audio.transcription = transcription;
        audio.status = 'completed';
      }
    },

    /**
     * Uploads audio files to the server
     * @param {string} url - Upload endpoint URL
     * @param {File[]} files - Array of files to upload
     * @returns {Promise<Object>} Upload response
     */
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
    /**
     * Gets audio files with 'ready' status
     * @returns {AudioFile[]}
     */
    getReadyAudios: (state) => {
      return state.audioFiles.filter(audio => audio.status === 'ready');
    },

    /**
     * Gets audio files with 'completed' status
     * @returns {AudioFile[]}
     */
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