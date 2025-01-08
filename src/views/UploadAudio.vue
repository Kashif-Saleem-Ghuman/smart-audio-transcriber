<template>
  <v-container style="position: relative !important;">
    <!-- Error Alert -->
    <v-alert v-if="error || isFileUploaded" :type="error ? 'error' : 'success'" class="mb-4 alert-icon-centered" closable 
      @click="() => {
        error = null;
        isFileUploaded = false;
      }">
      {{ error || 'Files uploaded successfully!' }}
    </v-alert>

    <!-- Upload Card -->
    <v-card class="upload-zone mb-4" @drop.prevent="handleDrop" @dragover.prevent @dragenter="dragEnter"
      @dragleave="dragLeave" @click="triggerFileInput" :class="{ 'drag-over': isDragging }" elevation="0" border
      :ripple="false">
      <v-card-text class="text-center pa-8">
        <v-icon size="64" color="primary" class="mb-4">mdi-cloud-upload</v-icon>
        <div class="text-h6 mb-2">
          Drag and drop or
          <span class="text-primary cursor-pointer">browse</span>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Supports MP3, WAV, M4A, and other audio formats
        </div>

        <!-- Hidden file input -->
        <input ref="fileInput" type="file" multiple accept="audio/*" class="d-none" @change="handleFileChange" />
      </v-card-text>
    </v-card>

    <!-- File List -->
    <div class="upload-container pb-3"
    :class="audioFiles?.length > 3 && !isMobile ? 'upload-container-fixed-height' : ''"
    >
      <!-- File List with fixed height and scroll -->
      <div v-if="audioFiles?.length" class="file-list">
        <v-card v-for="(file, index) in audioFiles" :key="index" elevation="0" border class="mb-2">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between w-100">
              <!-- File Icon and Name Group -->
              <div class="d-flex align-center file-content">
                <v-icon color="primary" size="24" class="me-3 flex-shrink-0">mdi-file-music</v-icon>
                <div class="file-info min-width-0">
                  <v-tooltip :text="file.name" location="top" open-on-hover
                    :disabled="!isTextTruncated($refs[`filename-${index}`])">
                    <template v-slot:activator="{ props }">
                      <div class="text-subtitle-2 text-truncate" :ref="`filename-${index}`" v-bind="props">
                        {{ file.name }}
                      </div>
                    </template>
                  </v-tooltip>
                  <span class="text-caption text-medium-emphasis">
                    {{ (file.size / (1024 * 1024)).toFixed(2) }} MB
                  </span>
                </div>
              </div>

              <!-- Close Button -->
              <v-btn icon="mdi-close" variant="text" density="comfortable" color="error" size="small"
                @click="removeFile(index)" :disabled="file.uploading" class="ms-2 flex-shrink-0" />
            </div>

            <!-- Progress Bar -->
            <v-progress-linear :model-value="88" color="primary" height="2" class="mt-3"></v-progress-linear>
          </v-card-text>
        </v-card>
      </div>
    </div>
    <!-- Action Buttons in a fixed position -->
    <div v-if="audioFiles?.length" class="action-buttons pe-4">
      <v-btn variant="outlined" color="error" @click="clearFiles" :disabled="uploading" :block="isMobile"
        :size="isMobile ? undefined : 'large'" class="action-btn text-capitalize">
        Cancel
      </v-btn>
      <v-btn color="primary" :loading="uploading" @click="uploadFiles" :block="isMobile"
        :size="isMobile ? undefined : 'large'" class="action-btn text-capitalize">
        {{ audioFiles.length === 1 ? 'Upload Audio' : 'Upload Audios' }}
      </v-btn>
    </div>
  </v-container>
</template>

<script>
import { useAudioStore } from "@/stores/audioStore";

/**
 * @component UploadAudio
 * @description Handles audio file uploads with drag and drop functionality
 */
export default {
  name: "UploadAudio",

  data() {
    return {
      /** @type {File[]} Array of audio files to be uploaded */
      audioFiles: [],
      /** @type {boolean} Flag indicating if upload is in progress */
      uploading: false,
      /** @type {string|null} Error message to display */
      error: null,
      /** @type {boolean} Flag indicating if file is being dragged over drop zone */
      isDragging: false,
      /** @type {boolean} Flag indicating if viewport is mobile width */
      isMobile: false,
      /** @type {Array<Function>} Array of validation rules for file input */
      fileRules: [
        /**
         * Validates audio files for type and size
         * @param {File|File[]} v - Single file or array of files to validate
         * @returns {boolean|string} True if valid, error message if invalid
         */
        (v) => {
          if (!v) return true;

          const files = Array.isArray(v) ? v : [v];
          for (const file of files) {
            if (!file.type.startsWith("audio/")) {
              return "Please upload audio files only";
            }
            const sizeInMB = file.size / (1024 * 1024);
            if (sizeInMB > 20) {
              return `File ${file.name} (${sizeInMB.toFixed(2)}MB) exceeds 20MB limit`;
            }
          }
          return true;
        },
      ],
      isFileUploaded: false,
    };
  },

  /**
   * Lifecycle hook - Sets up mobile detection
   */
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },

  /**
   * Lifecycle hook - Cleans up event listeners
   */
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },

  methods: {
    /**
     * Checks if the current viewport is mobile width
     * Updates isMobile state based on window width
     */
    checkMobile() {
      this.isMobile = window.innerWidth < 600;
    },

    /**
     * Handles file selection from the file input
     * Filters and adds valid audio files to the list
     * @param {Event} event - File input change event
     */
    handleFileChange(event) {
      const files = event.target.files;
      if (!files) return;

      const validFiles = Array.from(files).filter((file) => {
        const sizeInMB = file.size / (1024 * 1024);
        return file.type.startsWith("audio/") && sizeInMB <= 20;
      });

      this.audioFiles = [...this.audioFiles, ...validFiles];
      event.target.value = "";
    },

    /**
     * Handles files dropped into the drop zone
     * Filters and adds valid audio files to the list
     * @param {DragEvent} e - Drop event
     */
    handleDrop(e) {
      this.isDragging = false;
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("audio/")
      );

      if (files.length) {
        const validFiles = files.filter((file) => {
          const sizeInMB = file.size / (1024 * 1024);
          return file.type.startsWith("audio/") && sizeInMB <= 20;
        });
        this.audioFiles = [...this.audioFiles, ...validFiles];
      }
    },

    /**
     * Sets dragging state when files are dragged over the drop zone
     */
    dragEnter() {
      this.isDragging = true;
    },

    /**
     * Handles drag leave events for the drop zone
     * Only updates state if cursor leaves the drop zone completely
     * @param {DragEvent} e - Drag leave event
     */
    dragLeave(e) {
      if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget)) {
        this.isDragging = false;
      }
    },

    /**
     * Removes a file from the audio files list
     * @param {number} index - Index of the file to remove
     */
    removeFile(index) {
      if (!this.audioFiles[index].uploading) {
        this.audioFiles.splice(index, 1);
      }
    },

    /**
     * Clears all files from the audio files list
     */
    clearFiles() {
      this.audioFiles = [];
    },

    /**
     * Uploads all audio files to the server
     * Updates state based on upload success/failure
     * @returns {Promise<void>}
     */
    async uploadFiles() {
      if (!this.audioFiles?.length) return;

      const audioStore = useAudioStore();
      this.uploading = true;
      this.error = null;

      try {
        await audioStore.addAudio(this.audioFiles, 'upload');
        // show v-alert with success message
        this.isFileUploaded = true
        // await audioStore.uploadAudio("/audio-transcription", this.audioFiles);
        this.audioFiles = [];
      } catch (error) {
        console.error("Upload failed:", error);
        this.error = error.message || "Failed to upload audio files";
      } finally {
        this.uploading = false;
      }
    },

    /**
     * Triggers click event on the hidden file input
     */
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    /**
     * Checks if text element content is truncated
     * @param {HTMLElement} element - DOM element to check
     * @returns {boolean} True if text is truncated
     */
    isTextTruncated(element) {
      if (!element) return false;
      return element.scrollWidth > element.clientWidth;
    },
  },
};
</script>

<style scoped>
.upload-zone {
  border: none;
  background-image: repeating-linear-gradient(to right,
      rgb(var(--v-theme-primary)) 0,
      rgb(var(--v-theme-primary)) 12px,
      transparent 8px,
      transparent 16px),
    repeating-linear-gradient(to bottom,
      rgb(var(--v-theme-primary)) 0,
      rgb(var(--v-theme-primary)) 12px,
      transparent 8px,
      transparent 16px),
    repeating-linear-gradient(to right,
      rgb(var(--v-theme-primary)) 0,
      rgb(var(--v-theme-primary)) 12px,
      transparent 8px,
      transparent 16px),
    repeating-linear-gradient(to bottom,
      rgb(var(--v-theme-primary)) 0,
      rgb(var(--v-theme-primary)) 12px,
      transparent 8px,
      transparent 16px);
  background-position: 0 0, 0 0, 0 100%, 100% 0;
  background-size: 100% 2px, 2px 100%, 100% 2px, 2px 100%;
  background-repeat: no-repeat;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-zone.drag-over {
  background-color: rgb(var(--v-theme-surface-variant));
  border-style: dashed;
  border-width: 2px;
  /* Make dashes longer */
  border-image: repeating-linear-gradient(to right,
      rgb(var(--v-theme-primary)) 0,
      rgb(var(--v-theme-primary)) 15px,
      transparent 15px,
      transparent 25px) 2;
}

.upload-zone:hover {
  background-color: rgb(var(--v-theme-surface-variant));
}

.cursor-pointer {
  cursor: pointer;
}

.file-item {
  border-bottom: 1px solid rgb(var(--v-theme-border-color));
}

.file-item:last-child {
  border-bottom: none;
}

.file-list {
  max-height: 60vh;
  overflow-y: auto;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-card-text) {
  padding: 12px 16px !important;
}

:deep(.v-progress-linear) {
  margin-bottom: -2px;
}

.text-truncate {
  max-width: 300px;

  @media (max-width: 600px) {
    max-width: 200px;
  }
}

.upload-container {
  display: flex;
  flex-direction: column;
}

.upload-container-fixed-height{
  height: calc(100vh - 350px) !important;
  overflow-y: auto;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 70px;
  /* Space for buttons */
}

.action-buttons {
  position: absolute;
  bottom: -50px;
  right: 0;
  padding: 16px 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Add smooth scrollbar styling */
.file-list::-webkit-scrollbar {
  width: 8px;
}

.file-list::-webkit-scrollbar-track {
  background: transparent;
}

.file-list::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.1);
  border-radius: 4px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-primary), 0.2);
}

/* Ensure proper spacing */
.v-card.mb-2:last-child {
  margin-bottom: 0;
}

.file-content {
  flex: 1;
  min-width: 0;
  margin-right: 8px;
}

.file-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.action-btn { 
    min-width: 164px !important;
  }

/* Update mobile styles */
@media (max-width: 600px) {
  :deep(.v-card-text) {
    padding: 12px !important;
  }

  .text-truncate {
    max-width: calc(100vw - 120px);
  }

  /* Ensure close button stays visible */
  .v-btn.v-btn--size-small {
    min-width: 32px !important;
    padding: 0 !important;
  }

  .file-content {
    margin-right: 4px;
  }

  .action-buttons {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0 16px 16px 16px;
    z-index: 100;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .action-btn {
    width: 100%;
    height: 40px;
  }

  /* Adjust container padding to account for fixed buttons */
  .upload-container {
    height: calc(100vh - 360px);
    padding-bottom: 80px;
  }

  /* Ensure content doesn't hide behind buttons */
  .file-list {
    padding-bottom: 100px;
  }
}
</style>