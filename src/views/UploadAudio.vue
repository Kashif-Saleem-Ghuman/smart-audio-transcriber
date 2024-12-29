<template>
    <v-container>
        <v-row>
            <v-col cols="12" md="8" class="mx-auto">
                <!-- Error Alert -->
                <v-alert v-if="error" type="error" class="mb-4" closable :timeout="4000" @click:close="error = null">
                    {{ error }}
                </v-alert>

                <!-- Upload Section -->
                <v-card class="mb-6">
                    <v-card-title class="d-flex align-center py-4 px-6">
                        <v-icon icon="mdi-upload" size="24" class="me-2" color="primary" />
                        <span class="text-h5">Upload Audio</span>
                    </v-card-title>

                    <v-card-text>
                        <v-file-input v-model="audioFile" accept="audio/*" label="Choose audio file"
                            prepend-icon="mdi-music" :rules="fileRules" show-size @change="handleFileChange"
                            class="mb-4" :density="$vuetify.display.smAndDown ? 'compact' : 'default'"
                            :truncate-length="$vuetify.display.smAndDown ? 15 : undefined" hide-details="auto" />

                        <div class="upload-zone pa-8 mb-4" @drop.prevent="handleDrop" @dragover.prevent
                            @dragenter.prevent>
                            <div class="text-center">
                                <v-icon size="48" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
                                <div class="text-h6 mb-1">Drag and drop your audio file here</div>
                                <div class="text-body-2 text-medium-emphasis">or use the file input above</div>
                            </div>
                        </div>

                        <v-btn 
                            block 
                            color="primary" 
                            :size="$vuetify.display.smAndDown ? 'small' : 'large'"
                            :loading="uploading" 
                            :disabled="!audioFile"
                            @click="uploadFile" 
                            class="mb-2"
                        >
                            Upload and Transcribe
                        </v-btn>
                    </v-card-text>
                </v-card>

                <!-- Transcription Section -->
                <v-card v-if="transcription" class="mb-6">
                    <v-card-title class="d-flex align-center py-4 px-6">
                        <v-icon icon="mdi-text" size="24" class="me-2" color="primary" />
                        <span class="text-h5">Transcription</span>
                    </v-card-title>

                    <v-card-text>
                        <div class="audio-player mb-4">
                            <audio controls :src="audioUrl" class="w-100"></audio>
                        </div>

                        <v-sheet class="transcription-text pa-4 mb-4 rounded-lg" color="grey-lighten-4"
                            min-height="100">
                            {{ transcription }}
                        </v-sheet>
                    </v-card-text>
                </v-card>

                <!-- Prompt Section -->
                <v-card v-if="transcription">
                    <v-card-title class="d-flex align-center py-4 px-6">
                        <v-icon icon="mdi-pencil" size="24" class="me-2" color="primary" />
                        <span class="text-h5">Modify Transcription</span>
                    </v-card-title>

                    <v-card-text>
                        <v-textarea v-model="prompt" label="Enter your prompt to modify the transcription" rows="3"
                            class="mb-4" hide-details />

                        <v-btn block color="primary" size="large" :loading="modifying" :disabled="!prompt"
                            @click="modifyTranscription" class="mb-2">
                            Apply Changes
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { useAudioStore } from '@/stores/audioStore'

export default {
    name: 'UploadAudio',

    data() {
        return {
            audioFile: null,
            audioUrl: null,
            transcription: null,
            prompt: '',
            uploading: false,
            modifying: false,
            error: null,
            fileRules: [
                v => {
                    if (!v) return true

                    const file = Array.isArray(v) ? v[0] : v
                    if (!file || typeof file.size !== 'number') return true

                    // Check file type
                    if (!file.type.startsWith('audio/')) {
                        return 'Please upload an audio file'
                    }

                    // Check file size (20MB limit)
                    const sizeInMB = file.size / (1024 * 1024)
                    if (sizeInMB > 20) {
                        return `File size (${sizeInMB.toFixed(2)}MB) exceeds 20MB limit`
                    }

                    return true
                }
            ]
        }
    },

    methods: {
        handleFileChange(event) {
            if (event instanceof FileList) {
                this.audioFile = event[0]
            }
            else if (event instanceof File) {
                this.audioFile = event
            }
            else if (event?.target?.files) {
                this.audioFile = event.target.files[0]
            }

            if (this.audioFile && this.audioFile instanceof File) {
                this.audioUrl = URL.createObjectURL(this.audioFile)
                this.transcription = null
            } else {
                this.audioUrl = null
            }

            // Add size check when file is selected
            if (this.audioFile) {
                const sizeInMB = this.audioFile.size / (1024 * 1024)
                if (sizeInMB > 20) {
                    this.error = `File size (${sizeInMB.toFixed(2)}MB) exceeds 20MB limit`
                    this.audioFile = null
                    this.audioUrl = null
                    return
                }
            }
        },

        handleDrop(e) {
            const files = e.dataTransfer.files
            if (files.length) {
                const file = files[0]

                // Check file type
                if (!file.type.startsWith('audio/')) {
                    this.error = 'Please upload an audio file'
                    return
                }

                // Check file size
                const sizeInMB = file.size / (1024 * 1024)
                if (sizeInMB > 20) {
                    this.error = `File size (${sizeInMB.toFixed(2)}MB) exceeds 20MB limit`
                    return
                }

                this.transcription = null
                this.handleFileChange(file)
            }
        },

        async uploadFile() {
            if (!this.audioFile) return

            const audioStore = useAudioStore()
            this.uploading = true
            this.error = null

            try {
                const response = await audioStore.uploadAudio('/audio-transcription', this.audioFile)

                if (response?.data?.text) {
                    this.transcription = response.data.text
                    // Optionally show success message
                    // this.$toast.success('File uploaded successfully')
                }

            } catch (error) {
                console.error('Upload failed:', error)
                this.error = error.message || 'Failed to upload audio file'
                // Optionally show error message
                // this.$toast.error(this.error)
            } finally {
                this.uploading = false
            }
        },

        async modifyTranscription() {
            if (!this.prompt) return

            const audioStore = useAudioStore()
            this.modifying = true
            this.error = null

            try {
                const response = await audioStore.modifyTranscription(
                    `/audio-transcription/modify`,
                    this.prompt
                )

                this.transcription = response.data.transcription
                this.prompt = ''

            } catch (error) {
                console.error('Modification failed:', error)
                this.error = error.message || 'Failed to modify transcription'
            } finally {
                this.modifying = false
            }
        },

        // Cleanup when component is destroyed
        beforeUnmount() {
            if (this.audioUrl) {
                URL.revokeObjectURL(this.audioUrl)
            }
        }
    }
}
</script>

<style scoped>
.upload-zone {
    border: 2px dashed var(--v-primary-base);
    border-radius: 12px;
    transition: all 0.3s ease;
    background-color: var(--v-background-base);
}

.upload-zone:hover {
    background-color: var(--v-primary-lighten-5);
}

.audio-player {
    background-color: var(--v-background-base);
    border-radius: 8px;
    padding: 8px;
}

.audio-player audio {
    width: 100%;
}

.transcription-text {
    white-space: pre-wrap;
    font-family: 'Roboto Mono', monospace;
    line-height: 1.6;
}
</style>