import { defineStore } from 'pinia'
import { uploadClient, apiClient } from '@/api/axios'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    audioFiles: []
  }),

  actions: {
    // Upload multiple audio files
    uploadAudio(url, files) {
      const formData = new FormData()
      // Append each file with different field name
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file)
      })

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