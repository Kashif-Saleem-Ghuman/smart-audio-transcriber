import { defineStore } from 'pinia'
import { uploadClient, apiClient } from '@/api/axios'

export const useAudioStore = defineStore('audio', {
  state: () => ({
    audioFiles: []
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
    }
  },

  getters: {
    getReadyAudios: (state) => {
      return state.audioFiles.filter(audio => audio.status === 'ready');
    },
  },
}) 