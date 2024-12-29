import { defineStore } from 'pinia'
import { uploadClient, apiClient } from '@/api/axios'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    audioFiles: []
  }),

  actions: {
    // Upload audio file
    uploadAudio(url, file) {
      const formData = new FormData()
      formData.append('file', file)
      
      return uploadClient.post(url, formData, {
        timeout: 30000,
        responseType: 'json'
      })
    },

    // Get audio files list
    getAudioFiles(url) {
      return apiClient.get(url)
    },

    // Get single audio file details
    getAudioDetails(url) {
      return apiClient.get(url)
    },

    // Send prompt for transcription modification
    modifyTranscription(url, prompt) {
      return apiClient.post(url, { prompt })
    },

    // Delete audio file
    deleteAudio(url) {
      return apiClient.delete(url)
    }
  }
}) 