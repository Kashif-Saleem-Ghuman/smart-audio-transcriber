<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8" class="mx-auto">
        <!-- Error Alert -->
        <v-alert v-if="error" type="error" class="mb-4 alert-icon-centered" closable @click:close="error = null">
          {{ error }}
        </v-alert>

        <v-card class="transcribe-container">
          <v-card-title class="d-flex align-center py-4 px-6">
            <v-icon icon="mdi-text-to-speech" :size="$vuetify.display.smAndDown ? '24' : '32'" class="me-3"
              color="primary" />
            <span :class="$vuetify.display.smAndDown
              ? 'text-subtitle-2'
              : 'text-h6'
              ">
              Transcribe Audio Files
            </span>
          </v-card-title>

          <v-card-text>
            <v-alert v-if="!hasAudioFiles" type="info" class="mb-4">
              No audio files available for transcription. Please upload audio files or extract from YouTube first.
            </v-alert>

            <template v-else>
              <v-select v-model="selectedAudios" :items="availableAudios" item-title="title" item-value="id"
                label="Select Audio Files" multiple chips variant="outlined" prepend-inner-icon="mdi-music-note"
                :rules="[v => !!v.length || 'Please select at least one audio file']">
                <template v-slot:selection="{ item }">
                  <v-chip :prepend-icon="item.raw.source === 'youtube' ? 'mdi-youtube' : 'mdi-file-music'"
                    :color="item.raw.source === 'youtube' ? 'red' : 'primary'" class="mr-1">
                    {{ item.title }}
                  </v-chip>
                </template>
              </v-select>

              <v-select v-model="language" :items="languages" label="Audio Language" variant="outlined"
                prepend-inner-icon="mdi-translate" class="mt-4" :rules="[v => !!v || 'Please select a language']" />

              <v-btn block color="primary" :size="$vuetify.display.smAndDown ? 'small' : 'x-large'"
                :loading="processing" :disabled="!isValidForm" @click="processTranscription" elevation="2" class="mt-6">
                <v-icon start class="me-2">mdi-transcribe</v-icon>
                Start Transcription
              </v-btn>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAudioStore } from '@/stores/audioStore';

export default {
  name: 'TranscribeAudio',

  data() {
    return {
      selectedAudios: [],
      language: '',
      languages: [
        { title: 'English', value: 'en' },
        { title: 'Spanish', value: 'es' },
        { title: 'French', value: 'fr' },
        { title: 'German', value: 'de' },
        { title: 'Italian', value: 'it' },
      ],
      processing: false,
      error: null,
    };
  },

  computed: {
    audioStore() {
      return useAudioStore();
    },

    availableAudios() {
      return this.audioStore.getReadyAudios;
    },

    hasAudioFiles() {
      return this.availableAudios.length > 0;
    },

    isValidForm() {
      return this.selectedAudios.length > 0 && this.language;
    },
  },

  methods: {
    async processTranscription() {
      if (!this.isValidForm) return;

      this.processing = true;
      this.error = null;

      try {
        // Update status for selected audios
        this.selectedAudios.forEach(audioId => {
          this.audioStore.updateAudioStatus(audioId, 'transcribing');
        });

        // Make API call to process transcription
        await this.audioStore.transcribeAudios(
          this.selectedAudios,
          this.language
        );

        // Reset form after successful processing
        this.selectedAudios = [];
        this.language = '';
      } catch (error) {
        this.error = error.message || 'Failed to process transcription';
        // Revert status for failed transcriptions
        this.selectedAudios.forEach(audioId => {
          this.audioStore.updateAudioStatus(audioId, 'ready');
        });
      } finally {
        this.processing = false;
      }
    },
  },
};
</script>

<style scoped>
.transcribe-container {
  min-height: 400px;
}
</style>