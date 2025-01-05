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
          :timeout="4000"
          @click:close="error = null"
        >
          {{ error }}
        </v-alert>

        <v-card class="youtube-container">
          <!-- Sticky Add More Button -->
          <div class="sticky-header">
            <div class="text-right pa-3 mr-2">
              <v-btn
                prepend-icon="mdi-plus"
                class="add-more-button text-capitalize"
                :class="
                  $vuetify.display.smAndDown ? 'text-caption' : 'text-button'
                "
                size="x-small"
                variant="outlined"
                color="primary"
                @click="addNewCard"
                :disabled="youtubeCards.length >= 5"
              >
                Add More Links
              </v-btn>
            </div>
          </div>

          <!-- Scrollable Cards Section -->
          <div class="cards-container">
            <v-slide-y-transition group>
              <div v-for="card in youtubeCards" :key="card.id" class="pa-4">
                <v-card class="bg-grey-lighten-4" elevation="1">
                  <v-card-title class="d-flex align-center py-4 px-6">
                    <v-icon
                      icon="mdi-youtube"
                      :size="$vuetify.display.smAndDown ? '24' : '32'"
                      class="me-3"
                      color="primary"
                    />
                    <span
                      :class="
                        $vuetify.display.smAndDown
                          ? 'text-subtitle-2 text-wrap'
                          : 'text-h6'
                      "
                      >Extract Audio from YouTube</span
                    >

                    <v-spacer />

                    <v-btn
                      v-if="youtubeCards.length > 1"
                      icon="mdi-delete"
                      variant="text"
                      density="comfortable"
                      @click="removeCard(card.id)"
                      color="error"
                    />
                  </v-card-title>

                  <v-card-text>
                    <v-text-field
                      :id="card.titleId"
                      v-model="card.title"
                      label="Video Title"
                      variant="outlined"
                      density="comfortable"
                      class="mb-3"
                      prepend-inner-icon="mdi-format-title"
                      :rules="[validateTitle]"
                      @input="validateTitle"
                      hide-details="auto"
                    />

                    <v-text-field
                      :id="card.linkId"
                      v-model="card.link"
                      label="YouTube Video Link"
                      variant="outlined"
                      density="comfortable"
                      prepend-inner-icon="mdi-link"
                      :rules="[validateYoutubeUrl]"
                      @input="validateYoutubeUrl"
                      hide-details="auto"
                    />

                    <v-btn
                      block
                      color="primary"
                      :size="$vuetify.display.smAndDown ? 'small' : 'x-large'"
                      :loading="processing"
                      :disabled="!isValidForm"
                      @click="processYoutubeLinks"
                      elevation="2"
                      class="mt-4"
                    >
                      <v-icon start class="me-2">mdi-download</v-icon>
                      Extract Audio
                    </v-btn>
                  </v-card-text>
                </v-card>
              </div>
            </v-slide-y-transition>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "ExtractAudioFromYoutube",

  data() {
    return {
      youtubeCards: [this.createNewCard()],
      processing: false,
      error: null,
    };
  },

  computed: {
    isValidForm() {
      return this.youtubeCards.every(
        (card) =>
          card.title.trim() &&
          card.link.trim() &&
          this.validateYoutubeUrl(card.link) &&
          this.validateTitle(card.title)
      );
    },
  },

  methods: {
    createNewCard() {
      return {
        id: `card-${Math.random().toString(36).substr(2, 9)}`,
        titleId: `title-${Math.random().toString(36).substr(2, 9)}`,
        linkId: `link-${Math.random().toString(36).substr(2, 9)}`,
        title: "",
        link: "",
      };
    },

    addNewCard() {
      if (this.youtubeCards.length < 5) {
        this.youtubeCards.push(this.createNewCard());
      }
    },

    removeCard(cardId) {
      const index = this.youtubeCards.findIndex((card) => card.id === cardId);
      if (index !== -1) {
        this.youtubeCards.splice(index, 1);
      }
    },

    validateYoutubeUrl(url) {
      if (!url) return true; // Allow empty for v-rules
      const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      return pattern.test(url) || "Please enter a valid YouTube URL";
    },

    validateTitle(value) {
      if (!value) return true; // Allow empty for v-rules
      return (
        /^[a-zA-Z0-9\s]+$/.test(value) ||
        "Title must contain only letters, numbers, and spaces"
      );
    },

    async processYoutubeLinks() {
      if (!this.isValidForm) return;

      this.processing = true;
      this.error = null;

      try {
        // TODO: Implement the API call to process YouTube links
        console.log("Processing links:", this.youtubeCards);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      } catch (error) {
        this.error = error.message || "Failed to process YouTube links";
      } finally {
        this.processing = false;
      }
    },
  },
};
</script>

<style scoped>
.youtube-container {
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
  overflow-y: auto;
  padding-bottom: 16px;
}

.add-more-button {
  height: 33px !important;
}

/* Custom scrollbar for cards container */
.cards-container::-webkit-scrollbar {
  width: 8px;
}

.cards-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.cards-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.cards-container::-webkit-scrollbar-thumb:hover {
  background: #666;
}
</style>
