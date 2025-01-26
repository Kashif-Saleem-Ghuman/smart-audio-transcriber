<template>
  <v-container>
    <!-- Error/Success Alert -->
    <v-alert
      v-if="error || isFileUploaded"
      :type="error ? 'error' : 'success'"
      :color="error ? 'error-lighten' : 'success-lighten'"
      class="mb-4 alert-icon-centered"
      closable
      @click="
        () => {
          error = null;
          isFileUploaded = false;
        }
      "
    >
      <template v-slot:prepend>
        <v-icon
          :icon="error ? 'mdi-alert-circle' : 'mdi-check-circle'"
          :color="error ? 'error' : 'success'"
          start
        />
      </template>
      {{ error || "Files uploaded successfully!" }}
    </v-alert>

    <v-row>
      <v-col cols="12" class="">
        <v-card class="upload-container">
          <!-- Sticky Header -->
          <v-card-title class="d-flex align-center py-4 px-6">
            <v-icon
              icon="mdi-upload"
              :size="$vuetify.display.smAndDown ? '24' : '32'"
              class="me-3"
              color="primary"
            />
            <span
              :class="
                $vuetify.display.smAndDown ? 'text-subtitle-2' : 'text-h6'
              "
            >
              Add one or more audio Files with optional title to transcribe
            </span>
          </v-card-title>

          <v-divider></v-divider>

          <!-- Add More Button -->
          <div
            v-if="audioFiles?.length"
            class="sticky-header d-flex align-center justify-end pa-3"
          >
            <v-btn
              prepend-icon="mdi-plus"
              class="add-more-button text-capitalize"
              :class="
                $vuetify.display.smAndDown ? 'text-caption' : 'text-button'
              "
              size="small"
              variant="outlined"
              color="primary"
              @click="addNewCard"
              :disabled="audioFiles.length >= 5"
            >
              Add More Files ({{ audioFiles.length }}/5)
            </v-btn>
          </div>

          <!-- Cards Container -->
          <div class="cards-container">
            <!-- Hidden file input -->
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="audio/*"
              class="d-none"
              @change="handleFileChange"
            />

            <template v-if="audioFiles.length === 0">
              <div class="empty-state pa-8 text-center">
                <v-icon size="64" color="primary" class="mb-4"
                  >mdi-upload</v-icon
                >
                <div class="text-h6 mb-2">No Audio Files Added</div>
                <div class="text-body-2 text-medium-emphasis mb-4">
                  Add audio files to upload and transcribe
                </div>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="triggerFileInput"
                >
                  Add Audio File
                </v-btn>
              </div>
            </template>

            <template v-else>
              <div class="cards-wrapper">
                <v-slide-y-transition group>
                  <div
                    v-for="(file, index) in audioFiles"
                    :key="index"
                    class="pa-4"
                  >
                    <v-card class="bg-grey-lighten-4 audio-card" elevation="1">
                      <v-card-title class="d-flex align-center py-4 px-6">
                        <v-icon
                          icon="mdi-file-music"
                          :size="24"
                          class="me-3"
                          color="primary"
                        />
                        <span class="text-subtitle-1"
                          >Source
                          {{ audioFiles.length > 1 ? index + 1 : "" }}</span
                        >
                        <v-spacer />
                        <v-btn
                          icon="mdi-delete"
                          variant="text"
                          density="comfortable"
                          @click="removeFile(index)"
                          color="error"
                          :disabled="uploading"
                        />
                      </v-card-title>

                      <v-card-text class="pa-4">
                        <div class="input-fields-wrapper">
                          <div class="d-flex align-center mb-3">
                            <v-text-field
                              v-model="file.title"
                              label="Title (optional)"
                              variant="outlined"
                              density="comfortable"
                              :disabled="uploading"
                              hide-details="auto"
                              class="flex-grow-1"
                            >
                              <template #prepend-inner>
                                <v-icon>mdi-format-title</v-icon>
                              </template>
                            </v-text-field>
                          </div>

                          <div class="d-flex align-center">
                            <v-file-input
                              v-model="file.file"
                              :label="file.name || 'Choose File'"
                              variant="outlined"
                              density="comfortable"
                              accept="audio/*"
                              :error-messages="file.fileError"
                              :disabled="uploading"
                              @change="(e) => handleFileChange(e, index)"
                              hide-details="auto"
                              class="flex-grow-1"
                              prepend-icon=""
                            >
                              <template #prepend-inner>
                                <v-icon>mdi-paperclip</v-icon>
                              </template>
                            </v-file-input>
                          </div>

                          <div
                            v-if="file.file"
                            class="file-info d-flex align-center mt-2 ms-6"
                          >
                            <div class="text-truncate">{{ file.name }}</div>
                            <div class="text-caption text-medium-emphasis ms-2">
                              ({{ (file.size / (1024 * 1024)).toFixed(2) }} MB)
                            </div>
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </v-slide-y-transition>
              </div>
            </template>

            <!-- Fixed Upload Button -->
            <div v-if="audioFiles.length" class="upload-button-wrapper">
              <v-btn
                color="primary"
                :loading="uploading"
                :disabled="!isValidForm"
                @click="uploadFiles"
                :size="$vuetify.display.smAndDown ? 'small' : 'large'"
                prepend-icon="mdi-upload"
                class="text-capitalize"
                block
              >
                Upload {{ audioFiles.length > 1 ? "All" : "" }}
                {{ audioFiles.length > 1 ? "Audios" : "Audio" }}
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAudioStore } from "@/stores/audioStore";
import { io } from "socket.io-client";
import { baseURL } from "@/api/axios";
import { storeToRefs } from "pinia";

export default {
  name: "UploadAudio",

  data() {
    return {
      audioFiles: [],
      uploading: false,
      error: null,
      isFileUploaded: false,
      socket: null,
      transcription: "",
      uploadProgress: 0,
    };
  },

  created() {
    this.initializeWebSocket();
  },

  mounted() {
    this.checkMobile();
    window.addEventListener("resize", this.checkMobile);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.checkMobile);
    if (this.socket) {
      this.socket.disconnect();
    }
  },

  computed: {
    isValidForm() {
      return (
        this.audioFiles.length > 0 && this.audioFiles.every((file) => file.file)
      );
    },
  },

  methods: {
    /**
     * Initializes WebSocket connection
     */
    initializeWebSocket() {
      // Connect to the WebSocket server
      // use the base url from the apiClient
      this.socket = io(baseURL);

      // Listen for transcription chunks
      this.socket.on("transcription_chunk", (chunk) => {
        console.log("Chunk ---- On ------ ", chunk);
        this.transcription += chunk + " ";
      });

      this.socket.on("connect", () => {
        console.log("Connected to WebSocket server");
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from WebSocket server");
      });
    },

     /**
     * Checks if the current viewport is mobile width
     * Updates isMobile state based on window width
     */
    checkMobile() {
      this.isMobile = window.innerWidth < 600;
    },

    addNewCard() {
      if (this.audioFiles.length < 5) {
        this.audioFiles.push({
          id: `file-${Math.random().toString(36).substr(2, 9)}`,
          file: null,
          name: "",
          size: 0,
          title: "",
          fileError: null,
        });
      }
    },

    removeFile(index) {
      this.audioFiles.splice(index, 1);
    },

    handleFileChange(event, index) {
      if (!event) {
        this.audioFiles[index].file = null;
        this.audioFiles[index].name = "";
        this.audioFiles[index].size = 0;
        this.audioFiles[index].fileError = null;
        return;
      }

      const file = event instanceof File ? event : event.target.files?.[0];
      if (!file) return;

      // if (file.size > 20 * 1024 * 1024) {
      //   this.audioFiles[index].fileError = "File size should not exceed 20MB";
      //   this.audioFiles[index].file = null;
      //   this.audioFiles[index].name = "";
      //   this.audioFiles[index].size = 0;
      // } 
        this.audioFiles[index].file = file;
        this.audioFiles[index].name = file.name;
        this.audioFiles[index].size = file.size;
        this.audioFiles[index].fileError = null;
    },

    triggerFileInput() {
      this.addNewCard();
    },

    async uploadFiles() {
      if (!this.isValidForm) return;

      this.uploading = true;
      this.error = null;
      const audioStore = useAudioStore();

      try {
        for (const file of this.audioFiles) {
          console.log("Files being uploaded", this.audioFiles);
          console.log("single file being uploaded", file);
          await audioStore.uploadSingleFile(file.file, file.title);
        }
        this.isFileUploaded = true;
        this.audioFiles = [];
      } catch (error) {
        console.error("Upload failed:", error);
        this.error = error.message || "Failed to upload audio file";
      } finally {
        this.uploading = false;
        this.uploadProgress = 0;
      }
    },
  },
};
</script>

<style scoped>
.upload-container {
  position: relative;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}

.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.cards-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.cards-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 80px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  margin: 16px;
}

.upload-button-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.add-more-button {
  min-width: 140px !important;
  height: 36px !important;
}

.audio-card {
  position: relative;
  overflow: hidden;
  border-radius: 8px !important;
}

.audio-card::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: rgb(var(--v-theme-primary));
  border-radius: 4px 0 0 4px;
}

.file-info {
  padding: 8px;
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: 6px;
}

/* Custom scrollbar styles */
.cards-wrapper::-webkit-scrollbar {
  width: 8px;
}

.cards-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.cards-wrapper::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.cards-wrapper::-webkit-scrollbar-thumb:hover {
  background: #666;
}

/* Mobile styles */
@media (max-width: 600px) {
  .upload-button-wrapper {
    padding: 12px;
  }

  .cards-wrapper {
    padding-bottom: 70px;
  }

  .empty-state {
    margin: 8px;
  }
}

.input-fields-wrapper {
  padding: 0 8px;
}

:deep(.v-card-text) {
  padding: 16px 8px !important;
}
</style>
