<template>
  <div class="d-flex blog-container">
    <!-- Chat History Drawer -->
    <v-navigation-drawer permanent width="300" class="chat-drawer">
      <v-list>
        <!-- New Chat Button -->
        <v-list-item
          prepend-icon="mdi-plus"
          title="New Chat"
          color="primary"
          class="mb-2"
          @click="startNewChat"
        ></v-list-item>

        <v-divider class="mb-2"></v-divider>

        <!-- Chat History Items -->
        <v-list-item
          v-for="(chat, index) in chatHistory"
          :key="index"
          :active="currentChatId === chat.id"
          class="chat-history-item"
          @click="loadChat(chat)"
        >
          <v-tooltip
            :text="chat.title"
            location="right"
            :disabled="chat.title.length <= 25"
          >
            <template v-slot:activator="{ props }">
              <v-list-item-title 
                class="text-truncate"
                v-bind="props"
              >
                {{ chat.title }}
              </v-list-item-title>
            </template>
          </v-tooltip>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content Area -->
    <div class="flex-grow-1 main-content">
      <v-card v-if="!outline" class="pa-6">
        <h2 class="text-h5 mb-6">Generate Blog Article</h2>

        <v-form 
          @submit.prevent="handleGenerateOutline"
          v-model="formValid"
        >
          <v-text-field 
            v-model="blogTitle" 
            label="Blog Title" 
            placeholder="How to make money Farming?"
            class="mb-4"
            :rules="requiredRule"
            required
          >
            <template v-slot:label>
              Blog Title <span class="text-red">*</span>
            </template>
          </v-text-field>

          <v-select 
            v-model="selectedTranscripts" 
            :items="availableTranscripts" 
            label="Attach Transcriptions" 
            multiple
            chips 
            class="mb-4"
            :rules="requiredRule"
            required
          >
            <template v-slot:label>
              Attach Transcriptions <span class="text-red">*</span>
            </template>
            <template v-slot:selection="{ item }">
              <v-chip>{{ item.title }}</v-chip>
            </template>
          </v-select>

          <v-select 
            v-model="articleLength" 
            :items="['Short', 'Medium', 'Long']" 
            label="Article Length"
            class="mb-4"
            :rules="requiredRule"
            required
          >
            <template v-slot:label>
              Article Length <span class="text-red">*</span>
            </template>
          </v-select>

          <v-select 
            v-model="toneOfVoice" 
            :items="['Professional', 'Casual', 'Academic']" 
            label="Tone of Voice"
            class="mb-4"
            :rules="requiredRule"
            required
          >
            <template v-slot:label>
              Tone of Voice <span class="text-red">*</span>
            </template>
          </v-select>

          <v-select 
            v-model="pointOfView" 
            :items="['First Person', 'Second Person', 'Third Person']"
            label="Point of View" 
            class="mb-4"
            :rules="requiredRule"
            required
          >
            <template v-slot:label>
              Point of View <span class="text-red">*</span>
            </template>
          </v-select>

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
            :disabled="!formValid"
          >
            Generate Outline
          </v-btn>
        </v-form>
      </v-card>

      <v-card v-else-if="outline && !article" class="pa-6">
        <div class="d-flex justify-space-between align-center mb-6">
          <div class="d-flex align-center">
            <v-btn icon="mdi-arrow-left" variant="text" class="me-4" @click="goBackToInput"></v-btn>
            <h2 class="text-h5">Article Outline</h2>
          </div>
          <v-btn color="primary" @click="handleGenerateArticle" :loading="loading">
            ✨ Write Article ✨
          </v-btn>
        </div>

        <div class="outline-sections mb-3">
          <!-- Wrap all sections in draggable component -->
          <draggable 
            v-model="outline.sections" 
            item-key="id"
            handle=".drag-handle"
            class="dragArea"
          >
            <template #item="{element: section, index}">
              <v-card class="section-card mb-4">
                <v-card-item>
                  <div class="d-flex align-center">
                    <v-btn 
                      icon="mdi-drag" 
                      variant="text" 
                      size="small" 
                      class="drag-handle me-2"
                    ></v-btn>
                    <v-card class="element-card flex-grow-1 me-2">
                      <v-card-item class="d-flex align-center pa-2 custom-width">
                        <div class="d-flex align-center">
                          <v-select 
                            v-model="section.level" 
                            :items="headingTypes" 
                            hide-details 
                            density="compact"
                            class="heading-type-select" 
                            variant="plain"
                            style="min-width: 120px; width: 120px;"
                          ></v-select>
                          <v-text-field 
                            v-model="section.title" 
                            hide-details 
                            density="compact" 
                            variant="underlined"
                            class="title-field"
                            placeholder="Enter title"
                          ></v-text-field>
                        </div>
                      </v-card-item>
                    </v-card>
                    <v-btn 
                      icon="mdi-close" 
                      variant="text" 
                      size="small" 
                      color="error" 
                      class="ms-2"
                      @click="removeSection(index)"
                    ></v-btn>
                  </div>

                  <!-- Subsections -->
                  <draggable 
                    v-model="section.subsections" 
                    item-key="id"
                    handle=".subsection-drag-handle"
                    class="dragArea mt-3"
                  >
                    <template #item="{element: subsection, index: subIndex}">
                      <div class="subsection-item">
                        <div class="d-flex align-center">
                          <v-btn 
                            icon="mdi-drag" 
                            variant="text" 
                            size="small" 
                            class="subsection-drag-handle me-2"
                          ></v-btn>
                          <v-card class="element-card flex-grow-1 me-2">
                            <v-card-item class="d-flex align-center pa-2 custom-width">
                              <div class="d-flex align-center flex-grow-1">
                                <v-select 
                                  v-model="subsection.level" 
                                  :items="headingTypes" 
                                  hide-details 
                                  density="compact"
                                  class="heading-type-select me-4" 
                                  variant="plain"
                                ></v-select>
                                <v-text-field 
                                  v-model="subsection.title" 
                                  hide-details 
                                  density="compact" 
                                  variant="underlined"
                                  class="flex-grow-1"
                                  placeholder="Enter title"
                                ></v-text-field>
                              </div>
                            </v-card-item>
                          </v-card>
                          <v-btn 
                            icon="mdi-close" 
                            variant="text" 
                            size="small" 
                            color="error" 
                            class="ms-2"
                            @click="removeSubsection(index, subIndex)"
                          ></v-btn>
                        </div>
                      </div>
                    </template>
                  </draggable>

                  <!-- Add Subsection Menu -->
                  <v-menu location="bottom">
                    <template v-slot:activator="{ props }">
                      <v-btn variant="text" size="small" color="primary" class="ms-8 mt-2" prepend-icon="mdi-plus"
                        v-bind="props">
                        Add Element
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item v-for="type in elementTypes" :key="type.value" :title="type.title"
                        @click="addSubsection(index, type.value)"></v-list-item>
                    </v-list>
                  </v-menu>
                </v-card-item>
              </v-card>
            </template>
          </draggable>
        </div>

        <!-- Add Section Menu -->
        <v-menu location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn color="success" block prepend-icon="mdi-plus" v-bind="props">
              Add Section
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="type in elementTypes" :key="type.value" :title="type.title"
              @click="addSection(type.value)"></v-list-item>
          </v-list>
        </v-menu>
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
import draggable from 'vuedraggable'

export default {
  name: 'BlogArticles',

  components: {
    draggable
  },

  data() {
    return {
      blogTitle: '',
      selectedTranscripts: [],
      articleLength: '',
      toneOfVoice: '',
      pointOfView: '',
      additionalInstructions: '',
      chatHistory: [],
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
      ],
      currentChatId: null,
      defaultChatTitle: 'New Chat',
      formValid: false,
      requiredRule: [
        v => !!v || 'This field is required'
      ],
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

    startNewChat() {
      const blogStore = useBlogStore()
      const newChat = {
        id: Date.now(),
        title: this.defaultChatTitle,
        outline: null,
        article: null,
        settings: {
          blogTitle: '',
          selectedTranscripts: [],
          articleLength: '',
          toneOfVoice: '',
          pointOfView: '',
          additionalInstructions: ''
        }
      }
      
      this.chatHistory.unshift(newChat)
      this.loadChat(newChat)
      // Reset the store state and form validation
      blogStore.$patch({
        outline: null,
        article: null
      })
      this.formValid = false
    },

    loadChat(chat) {
      const blogStore = useBlogStore()
      this.currentChatId = chat.id
      
      // Reset form fields
      this.blogTitle = chat.settings.blogTitle || ''
      this.selectedTranscripts = chat.settings.selectedTranscripts || []
      this.articleLength = chat.settings.articleLength || ''
      this.toneOfVoice = chat.settings.toneOfVoice || ''
      this.pointOfView = chat.settings.pointOfView || ''
      this.additionalInstructions = chat.settings.additionalInstructions || ''
      
      // Load outline and article if they exist
      blogStore.$patch({
        outline: chat.outline,
        article: chat.article
      })
    },

    async handleGenerateOutline() {
      const currentChat = this.chatHistory.find(chat => chat.id === this.currentChatId)
      if (currentChat) {
        // Update chat title with blog title
        currentChat.title = this.blogTitle || this.defaultChatTitle
        
        // Save current settings
        currentChat.settings = {
          blogTitle: this.blogTitle,
          selectedTranscripts: this.selectedTranscripts,
          articleLength: this.articleLength,
          toneOfVoice: this.toneOfVoice,
          pointOfView: this.pointOfView,
          additionalInstructions: this.additionalInstructions
        }
      }

      await this.generateOutline({
        title: this.blogTitle,
        transcripts: this.selectedTranscripts,
        length: this.articleLength,
        tone: this.toneOfVoice,
        pov: this.pointOfView,
        instructions: this.additionalInstructions
      })

      // Save generated outline to current chat
      if (currentChat) {
        currentChat.outline = this.outline
      }
    },

    async handleGenerateArticle() {
      // Format the outline data
      const formattedOutline = this.outline.sections.reduce((acc, section, index) => {
        // Create array of all elements in order (section title + subsections)
        const orderedElements = [
          {
            level: section.level,
            title: section.title
          },
          ...section.subsections
        ].map(element => `${element.level}: ${element.title}`);

        acc[`Section${index + 1}`] = {
          name: `Section ${index + 1}: ${section.title}`,
          Outline: orderedElements
        };
        console.log("write article output::::", acc)
        return acc;
      }, {});

      // Call generateArticle with formatted outline
      await this.generateArticle(formattedOutline);
      
      // Save generated article to current chat
      const currentChat = this.chatHistory.find(chat => chat.id === this.currentChatId);
      if (currentChat) {
        currentChat.article = this.article;
      }
    },

    goBackToInput() {
      const blogStore = useBlogStore()
      // Update the store state
      blogStore.$patch({
        outline: null,
        article: null
      })
      
      // Update the current chat's outline
      const currentChat = this.chatHistory.find(chat => chat.id === this.currentChatId)
      if (currentChat) {
        currentChat.outline = null
        currentChat.article = null
      }
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
    }
  },

  created() {
    // Start with a new chat when component is created
    this.startNewChat()
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
  max-height: calc(100vh - 300px) !important;
  overflow-y: auto !important;
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
  flex: 0 0 120px;
  margin-right: 16px;
}

.title-field {
  flex: 1;
  min-width: 0;
}

:deep(.title-field .v-field__input) {
  width: 100%;
}

.outline-sections {
  max-width: 800px;
  margin: 0 auto;
}

.section-card {
  transition: transform 0.2s ease;
}

.section-card:hover {
  transform: translateY(-2px);
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.chosen {
  opacity: 0.5;
  background: #c8ebfb;
}

.chat-history-item {
  margin-bottom: 4px;
}

.chat-history-item :deep(.v-list-item-title) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-navigation-drawer :deep(.v-list-item--active) {
  background-color: rgb(var(--v-theme-primary-lighten-1));
}

.text-red {
  color: rgb(var(--v-theme-error));
}

.element-card {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  width: 100%;
}

.element-card:hover {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-card {
  background-color: rgb(250, 250, 250);
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.section-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.v-card-item) {
  padding: 8px 12px;
}

:deep(.element-card .v-field__input) {
  padding-top: 8px;
  padding-bottom: 8px;
  width: 100%;
}

.drag-handle,
.subsection-drag-handle {
  cursor: move;
}

.dragArea {
  min-height: 10px;
}

.section-card {
  transition: transform 0.2s ease;
}

.section-card:hover {
  transform: translateY(-2px);
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.chosen {
  opacity: 0.5;
  background: #c8ebfb;
}

.chat-history-item {
  margin-bottom: 4px;
}

.chat-history-item :deep(.v-list-item-title) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-navigation-drawer :deep(.v-list-item--active) {
  background-color: rgb(var(--v-theme-primary-lighten-1));
}

.text-red {
  color: rgb(var(--v-theme-error));
}

.element-card {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  width: 100%;
}

.element-card:hover {
  border-color: rgba(0, 0, 0, 0.15);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.section-card {
  background-color: rgb(250, 250, 250);
  border: 1px solid rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.section-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.v-card-item) {
  padding: 8px 12px;
}

:deep(.element-card .v-field__input) {
  padding-top: 8px;
  padding-bottom: 8px;
  width: 100%;
}

:deep(.v-field__input) {
  white-space: normal !important;
  word-wrap: break-word !important;
}

:deep(.v-text-field input) {
  white-space: normal !important;
  word-wrap: break-word !important;
}
</style>

<style>
.custom-width .v-card-item__content{
  width: 100% !important;
}
</style>