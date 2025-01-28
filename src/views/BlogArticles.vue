<template>
  <div class="d-flex blog-container">
    <!-- Chat History Drawer -->
    <v-navigation-drawer
      permanent
      width="300"
      class="chat-drawer"
    >
      <v-list>
        <v-list-item
          v-for="(chat, index) in chatHistory"
          :key="index"
          :title="chat.title"
          @click="loadChat(chat)"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content Area -->
    <div class="flex-grow-1 main-content">
      <v-card v-if="!outline" class="pa-6">
        <h2 class="text-h5 mb-6">Generate Blog Article</h2>
        
        <v-form @submit.prevent="handleGenerateOutline">
          <v-text-field
            v-model="blogTitle"
            label="Blog Title"
            placeholder="How to make money Farming?"
            class="mb-4"
          ></v-text-field>

          <v-select
            v-model="selectedTranscripts"
            :items="availableTranscripts"
            label="Attach Transcriptions"
            multiple
            chips
            class="mb-4"
          >
            <template v-slot:selection="{ item }">
              <v-chip>{{ item.title }}</v-chip>
            </template>
          </v-select>

          <v-select
            v-model="articleLength"
            :items="['Short', 'Medium', 'Long']"
            label="Article Length"
            class="mb-4"
          ></v-select>

          <v-select
            v-model="toneOfVoice"
            :items="['Professional', 'Casual', 'Academic']"
            label="Tone of Voice"
            class="mb-4"
          ></v-select>

          <v-select
            v-model="pointOfView"
            :items="['First Person', 'Second Person', 'Third Person']"
            label="Point of View"
            class="mb-4"
          ></v-select>

          <v-textarea
            v-model="additionalInstructions"
            label="Additional Instructions to AI"
            rows="3"
            class="mb-4"
          ></v-textarea>

          <v-btn
            color="primary"
            block
            :loading="loading"
            type="submit"
          >
            Generate Outline
          </v-btn>
        </v-form>
      </v-card>

      <v-card v-else-if="outline && !article" class="pa-6">
        <div class="d-flex justify-space-between align-center mb-6">
          <div class="d-flex align-center">
            <v-btn
              icon="mdi-arrow-left"
              variant="text"
              class="me-4"
              @click="goBackToInput"
            ></v-btn>
            <h2 class="text-h5">Article Outline</h2>
          </div>
          <v-btn
            color="primary"
            @click="handleGenerateArticle"
            :loading="loading"
          >
            ✨ Write Article ✨
          </v-btn>
        </div>

        <div class="outline-sections">
          <!-- Introduction Card -->
          <v-card class="section-card mb-4">
            <v-card-item>
              <div class="d-flex align-center">
                <v-select
                  v-model="outline.intro.level"
                  :items="headingTypes"
                  hide-details
                  density="compact"
                  class="heading-type-select"
                  variant="plain"
                ></v-select>
                <v-text-field
                  v-model="outline.intro.title"
                  hide-details
                  density="compact"
                  variant="underlined"
                  class="flex-grow-1"
                ></v-text-field>
              </div>
            </v-card-item>
          </v-card>

          <!-- Main Sections -->
          <v-card
            v-for="(section, index) in outline.sections"
            :key="section.id"
            class="section-card mb-4"
          >
            <v-card-item>
              <!-- H2 Section -->
              <div class="d-flex align-center">
                <v-select
                  v-model="section.level"
                  :items="headingTypes"
                  hide-details
                  density="compact"
                  class="heading-type-select"
                  variant="plain"
                ></v-select>
                <v-text-field
                  v-model="section.title"
                  hide-details
                  density="compact"
                  variant="underlined"
                  class="flex-grow-1"
                ></v-text-field>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  class="ms-2"
                  @click="removeSection(index)"
                ></v-btn>
              </div>

              <!-- Subsections -->
              <div 
                v-for="(subsection, subIndex) in section.subsections"
                :key="subsection.id"
                class="subsection-item"
              >
                <div class="d-flex align-center">
                  <v-select
                    v-model="subsection.level"
                    :items="headingTypes"
                    hide-details
                    density="compact"
                    class="heading-type-select"
                    variant="plain"
                  ></v-select>
                  <v-text-field
                    v-model="subsection.title"
                    hide-details
                    density="compact"
                    variant="underlined"
                    class="flex-grow-1"
                  ></v-text-field>
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    class="ms-2"
                    @click="removeSubsection(index, subIndex)"
                  ></v-btn>
                </div>
              </div>

              <!-- Add Subsection Menu -->
              <v-menu location="bottom">
                <template v-slot:activator="{ props }">
                  <v-btn
                    variant="text"
                    size="small"
                    color="primary"
                    class="ms-8 mt-2"
                    prepend-icon="mdi-plus"
                    v-bind="props"
                  >
                    Add Element
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="type in elementTypes"
                    :key="type.value"
                    :title="type.title"
                    @click="addSubsection(index, type.value)"
                  ></v-list-item>
                </v-list>
              </v-menu>
            </v-card-item>
          </v-card>

          <!-- Add Section Menu -->
          <v-menu location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                color="success"
                block
                prepend-icon="mdi-plus"
                v-bind="props"
              >
                Add Section
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="type in elementTypes"
                :key="type.value"
                :title="type.title"
                @click="addSection(type.value)"
              ></v-list-item>
            </v-list>
          </v-menu>
        </div>
      </v-card>

      <v-card v-else class="pa-6">
        <div class="d-flex justify-space-between align-center mb-6">
          <h2 class="text-h5">Generated Article</h2>
          <div>
            <v-btn icon="mdi-content-copy" @click="copyArticle"></v-btn>
            <v-btn icon="mdi-download" @click="downloadArticle"></v-btn>
          </div>
        </div>

        <div v-html="article" class="article-content"></div>
      </v-card>
    </div>
  </div>
</template>

<script>
import { useBlogStore } from '@/stores/blogStore'
import { mapState, mapActions } from 'pinia'

export default {
  name: 'BlogArticles',

  data() {
    return {
      blogTitle: '',
      selectedTranscripts: [],
      articleLength: '',
      toneOfVoice: '',
      pointOfView: '',
      additionalInstructions: '',
      chatHistory: [
        { title: 'First Chat heading' },
        { title: 'Second Chat heading' }
      ],
      headingTypes: [
        { title: 'Heading 1', value: 'H1' },
        { title: 'Heading 2', value: 'H2' },
        { title: 'Heading 3', value: 'H3' },
        { title: 'Heading 4', value: 'H4' },
        { title: 'Paragraph', value: 'P' }
      ],
      elementTypes: [
        { title: 'Heading 2', value: 'H2' },
        { title: 'Heading 3', value: 'H3' },
        { title: 'Heading 4', value: 'H4' },
        { title: 'Paragraph', value: 'P' }
      ]
    }
  },

  computed: {
    ...mapState(useBlogStore, ['outline', 'article', 'loading']),
    
    availableTranscripts() {
      // This would come from your audio store
      return [
        { title: 'Transcript 1', value: 1 },
        { title: 'Transcript 2', value: 2 }
      ]
    }
  },

  methods: {
    ...mapActions(useBlogStore, ['generateOutline', 'generateArticle']),

    async handleGenerateOutline() {
      await this.generateOutline({
        title: this.blogTitle,
        transcripts: this.selectedTranscripts,
        length: this.articleLength,
        tone: this.toneOfVoice,
        pov: this.pointOfView,
        instructions: this.additionalInstructions
      })
    },

    async handleGenerateArticle() {
      await this.generateArticle()
    },

    goBackToInput() {
      this.outline = null
    },

    addSection(type = 'H2') {
      const newId = `section_${Date.now()}`
      this.outline.sections.push({
        id: newId,
        level: type,
        title: `New ${type}`,
        content: '',
        subsections: []
      })
    },

    removeSection(index) {
      this.outline.sections.splice(index, 1)
    },

    addSubsection(sectionIndex, type = 'H3') {
      const newId = `subsection_${Date.now()}`
      this.outline.sections[sectionIndex].subsections.push({
        id: newId,
        level: type,
        title: `New ${type}`,
        content: ''
      })
    },

    removeSubsection(sectionIndex, subsectionIndex) {
      this.outline.sections[sectionIndex].subsections.splice(subsectionIndex, 1)
    },

    copyArticle() {
      navigator.clipboard.writeText(this.article)
    },

    downloadArticle() {
      const blob = new Blob([this.article], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'article.html'
      a.click()
      window.URL.revokeObjectURL(url)
    },

    loadChat(chat) {
      // Implementation for loading chat history
    }
  }
}
</script>

<style scoped>
.blog-container {
  height: 100%;
}

.chat-drawer {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.main-content {
  padding: 16px;
  overflow-y: auto;
}

.article-content {
  font-family: 'Georgia', serif;
  line-height: 1.6;
}

.section-item {
  margin-bottom: 24px;
}

.subsection-item {
  margin-left: 32px;
  margin-top: 12px;
}

.section-label {
  background: #e0e0e0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  min-width: 40px;
  text-align: center;
}

.outline-sections {
  max-width: 800px;
  margin: 0 auto;
}

.section-card {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background-color: rgb(250, 250, 250);
  transition: all 0.3s ease;
}

.section-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.heading-type-select {
  max-width: 120px;
}

.subsection-item {
  margin-left: 24px;
  margin-top: 16px;
  padding-left: 16px;
  border-left: 2px solid rgba(0, 0, 0, 0.12);
}

.outline-sections {
  max-width: 800px;
  margin: 0 auto;
}

:deep(.v-card-item) {
  padding: 20px;
}

:deep(.v-select .v-field) {
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.v-text-field .v-field) {
  border-radius: 0;
}
</style> 