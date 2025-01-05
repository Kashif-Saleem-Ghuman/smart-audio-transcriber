<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" class="mx-auto">
        <!-- Error Alert -->
        <v-alert
          v-if="error"
          type="error"
          class="mb-4 alert-icon-centered"
          closable

          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <!-- Upload Section -->
        <v-card class="upload-card">
          <v-card-title class="d-flex align-center py-4 px-6">
            <v-icon
              icon="mdi-upload"
              :size="$vuetify.display.smAndDown ? '24' : '32'"
              class="me-3"
              color="primary"
            />
            <span
              :class="
                $vuetify.display.smAndDown
                  ? 'text-subtitle-1 text-wrap'
                  : 'text-h6'
              "
              class="font-weight-medium"
              >Upload Audio Files</span
            >
          </v-card-title>

          <v-card-text>
            <v-file-input
              :model-value="audioFiles"
              multiple
              accept="audio/*"
              label="Choose audio files"
              prepend-icon="mdi-music"
              :rules="fileRules"
              @update:model-value="handleFileChange"
              class="mb-4 file-input"
              :density="$vuetify.display.smAndDown ? 'compact' : 'default'"
              chips
              counter
              variant="outlined"
              :show-size="1000"
            />

            <div
              class="upload-zone pa-8 mb-4"
              @drop.prevent="handleDrop"
              @dragover.prevent
              @dragenter="dragEnter"
              @dragleave="dragLeave"
              :class="{ 'drag-over': isDragging }"
            >
              <div class="text-center">
                <v-icon
                  :size="$vuetify.display.smAndDown ? '48' : '64'"
                  color="primary"
                  class="mb-3"
                  >mdi-cloud-upload</v-icon
                >
                <div
                  :class="$vuetify.display.smAndDown ? 'text-h6' : 'text-h5'"
                  class="mb-2"
                >
                  Drag and drop your audio files here
                </div>
                <div
                  :class="
                    $vuetify.display.smAndDown ? 'text-body-2' : 'text-body-1'
                  "
                  class="text-medium-emphasis"
                >
                  Supports MP3, WAV, M4A, and other audio formats
                </div>
                <div class="text-caption text-medium-emphasis mt-2">
                  Maximum file size: 20MB
                </div>
              </div>
            </div>

            <!-- File List -->
            <v-slide-y-transition group>
              <v-list
                v-if="audioFiles?.length"
                class="file-list mb-4"
                variant="flat"
              >
                <v-list-item
                  v-for="(file, index) in audioFiles"
                  :key="index"
                  class="file-item mb-2"
                >
                  <template v-slot:prepend>
                    <v-icon color="primary">mdi-music-circle</v-icon>
                  </template>
                  <v-list-item-title>{{ file.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ (file.size / (1024 * 1024)).toFixed(2) }} MB
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-btn
                      icon="mdi-close"
                      variant="text"
                      size="small"
                      @click="removeFile(index)"
                    />
                  </template>
                </v-list-item>
              </v-list>
            </v-slide-y-transition>

            <v-btn
              block
              color="primary"
              :size="$vuetify.display.smAndDown ? 'small' : 'x-large'"
              :loading="uploading"
              :disabled="!audioFiles?.length"
              @click="uploadFiles"
              class="mt-4"
              elevation="2"
            >
              <v-icon start class="me-2">mdi-cloud-upload</v-icon>
              Upload Files
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAudioStore } from "@/stores/audioStore";

export default {
  name: "UploadAudio",

  data() {
    return {
      audioFiles: [],
      uploading: false,
      error: null,
      isDragging: false,
      fileRules: [
        (v) => {
          if (!v) return true;

          const files = Array.isArray(v) ? v : [v];
          for (const file of files) {
            if (!file.type.startsWith("audio/")) {
              return "Please upload audio files only";
            }
            const sizeInMB = file.size / (1024 * 1024);
            if (sizeInMB > 20) {
              return `File ${file.name} (${sizeInMB.toFixed(
                2
              )}MB) exceeds 20MB limit`;
            }
          }
          return true;
        },
      ],
    };
  },

  methods: {
    handleFileChange(files) {
      if (!files) {
        this.audioFiles = [];
        return;
      }
      // Filter valid files
      const validFiles = files.filter((file) => {
        const sizeInMB = file.size / (1024 * 1024);
        return file.type.startsWith("audio/") && sizeInMB <= 20;
      });
      // Append new files to existing ones
      this.audioFiles = [...this.audioFiles, ...validFiles];
    },

    handleDrop(e) {
      this.isDragging = false;
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("audio/")
      );
      // Use the same logic as handleFileChange
      if (files.length) {
        const validFiles = files.filter((file) => {
          const sizeInMB = file.size / (1024 * 1024);
          return file.type.startsWith("audio/") && sizeInMB <= 20;
        });
        this.audioFiles = [...this.audioFiles, ...validFiles];
      }
    },

    dragEnter() {
      this.isDragging = true;
    },

    dragLeave(e) {
      if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
        this.isDragging = false;
      }
    },

    removeFile(index) {
      this.audioFiles.splice(index, 1);
    },

    async uploadFiles() {
      if (!this.audioFiles?.length) return;

      const audioStore = useAudioStore();
      this.uploading = true;
      this.error = null;

      try {
        // Pass the array of files directly to the store method
        await audioStore.uploadAudio("/audio-transcription", this.audioFiles);

        this.audioFiles = [];
        // Add success notification here if needed
      } catch (error) {
        console.error("Upload failed:", error);
        this.error = error.message || "Failed to upload audio files";
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped>
.upload-card {
  border-radius: 16px;
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}

.upload-zone {
  border: 2px dashed var(--v-primary-base);
  border-radius: 16px;
  transition: all 0.3s ease;
  background-color: var(--v-background-base);
}

.upload-zone.drag-over {
  border-color: var(--v-primary-darken-1);
  background-color: var(--v-primary-lighten-5);
  transform: scale(1.01);
}

.upload-zone:hover {
  background-color: var(--v-primary-lighten-5);
}

.file-input {
  max-height: 150px;
  overflow-y: auto;
}

.file-list {
  border-radius: 12px;
  background-color: var(--v-background-base);
  overflow-y: auto;
  max-height: 100px;
}

.file-item {
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background-color: var(--v-primary-lighten-5);
}
</style>
