<template>
  <v-container class="fill-height pa-0" fluid>
    <v-row class="fill-height">
      <!-- Navigation Drawer -->
      <v-navigation-drawer
        v-model="drawer"
        :permanent="!isMobile"
        :temporary="isMobile"
        :rail="isRail && !isMobile"
        @click="handleDrawerClick"
        elevation="1"
        width="200"
      >
        <v-list density="compact" nav>
          <v-list-item
            v-for="(chat, index) in chats"
            :key="index"
            :value="chat"
            :title="chat.title"
            @click="selectChat(chat)"
          >
            <template v-slot:prepend>
              <v-icon>mdi-message-text</v-icon>
            </template>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Main Chat Section -->
      <v-col class="d-flex flex-column pa-0 chat-container"
        :class="this.$vuetify.display.smAndDown ? 'mobile-chat-container' : 'desktop-chat-container'"
      >
        <!-- Mobile Menu Button -->
        <v-app-bar v-if="isMobile" density="compact" elevation="0" class="mobile-app-bar bg-grey-lighten-4">
          <v-app-bar-nav-icon @click="drawer = !drawer" color="primary"></v-app-bar-nav-icon>
          <v-toolbar-title class="text-body-2 text-primary">
            Chat History
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-refresh" variant="text" size="small" color="primary"></v-btn>
        </v-app-bar>

        <!-- Chat Messages Area -->
        <div class="chat-messages">
          <v-col class="pa-4">
            <div class="chat-messages-container">
              <div v-for="(message, index) in messages" :key="index" 
                   :class="['message-wrapper', message.isUser ? 'user-message' : 'ai-message']">
                <div class="d-flex align-center mb-1">
                  <v-avatar size="24" :color="message.isUser ? 'primary' : 'success'" class="me-2">
                    <v-icon size="small" color="white">
                      {{ message.isUser ? 'mdi-account' : 'mdi-robot' }}
                    </v-icon>
                  </v-avatar>
                  <span class="text-caption text-medium-emphasis">
                    {{ message.isUser ? 'You' : 'AI Assistant' }}
                  </span>
                  <span class="text-caption text-medium-emphasis ms-2">
                    {{ formatTime(message.timestamp) }}
                  </span>
                </div>
                <div class="text-body-1">{{ message.content }}</div>
              </div>
            </div>
          </v-col>
        </div>
        <!-- Prompt Input Area -->
        <div class="prompt-area px-6 mx-1 mb-6 mb-md-0"
        >
          <v-row class="pa-2 bg-grey-lighten-2 rounded-lg">
            <v-col class="pa-2">
              <v-form @submit.prevent="sendMessage">
                <v-textarea
                  v-model="userPrompt"
                  label="Enter your prompt"
                  rows="1"
                  auto-grow
                  hide-details
                  class="mb-2 prompt-textarea"
                  :loading="processingPrompt"
                  :disabled="processingPrompt"
                  variant="flat"
                  density="comfortable"
                  max-rows="4"
                ></v-textarea>
                <div class="d-flex align-center">
                  <div class="d-flex align-center gap-2">
                    <v-tooltip text="Attach transcriptions to analyze" location="top">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          variant="text"
                          density="comfortable"
                          icon="mdi-paperclip"
                          size="small"
                          color="primary"
                          @click="openFileDialog"
                        ></v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                  <v-chip-group class="mx-4">
                    <v-chip
                      v-for="(suggestion, index) in promptSuggestions"
                      :key="index"
                      size="small"
                      @click="userPrompt = suggestion"
                    >
                      {{ suggestion }}
                    </v-chip>
                  </v-chip-group>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    icon="mdi-send"
                    @click="sendMessage"
                    size="small"
                    :loading="processingPrompt"
                    :disabled="!userPrompt.trim()"
                  ></v-btn>
                </div>
              </v-form>
            </v-col>
          </v-row>
        </div>

        <!-- File Selection Dialog -->
        <v-dialog v-model="showFileDialog" max-width="500">
          <v-card>
            <v-card-title>Select Transcriptions</v-card-title>
            <v-card-text>
              <v-select
                v-model="selectedTranscriptions"
                :items="availableTranscriptions"
                label="Select transcriptions"
                multiple
                chips
              ></v-select>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" variant="text" @click="attachFiles">Attach</v-btn>
              <v-btn color="grey" variant="text" @click="showFileDialog = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "ProcessTranscriptions",

  data() {
    return {
      drawer: true,
      isRail: false,
      isMobile: false,
      userPrompt: "",
      chats: [
        {
          id: 1,
          title: "Chat 1",
        },
        {
          id: 2,
          title: "Chat 2",
        },
      ],
      selectedChat: null,
      messages: [
        {
          content: "Hello! How can I help you today?",
          isUser: false,
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          content: "How is the weather in Pakistan?",
          isUser: true,
          timestamp: new Date(Date.now() - 3500000),
        },
        {
          content:
            "The weather in Pakistan is generally hot and sunny, with temperatures ranging from 25°C to 35°C during the day. The weather is influenced by the monsoon season, which typically occurs from June to September. During this time, the country experiences heavy rainfall and thunderstorms. It is advisable to carry light clothing, sunglasses, and sunscreen when traveling to Pakistan.",
          isUser: false,
          timestamp: new Date(Date.now() - 3400000),
        },
        {
          content: "What is the capital of Pakistan?",
          isUser: true,
          timestamp: new Date(Date.now() - 3300000),
        },
        {
          content: "The capital of Pakistan is Islamabad.",
          isUser: false,
          timestamp: new Date(Date.now() - 3200000),
        },
        {
          content: "What is the population of Pakistan?",
          isUser: true,
          timestamp: new Date(Date.now() - 3100000),
        },
        {
          content:
            "The population of Pakistan is approximately 220 million people.",
          isUser: false,
          timestamp: new Date(Date.now() - 3000000),
        },
        {
          content: "What is the official language of Pakistan?",
          isUser: true,
          timestamp: new Date(Date.now() - 2900000),
        },
        {
          content: "The official language of Pakistan is Urdu.",
          isUser: false,
          timestamp: new Date(Date.now() - 2800000),
        },
      ],
      showFileDialog: false,
      selectedTranscriptions: [],
      availableTranscriptions: [
        { title: 'Interview_001.txt', value: 1 },
        { title: 'Meeting_2024_01_15.txt', value: 2 },
        { title: 'Conference_Call_Q4.txt', value: 3 },
        { title: 'Customer_Feedback_Session.txt', value: 4 },
      ],
      processingPrompt: false,
      promptSuggestions: [
        'Summarize this transcript',
        'Extract action items',
        'List all participants',
        'Generate meeting minutes',
        'Identify key decisions',
        'Translate to Spanish'
      ],
    };
  },

  mounted() {
    this.checkScreenSize();
    window.addEventListener("resize", this.checkScreenSize);
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.checkScreenSize);
  },

  methods: {
    handleDrawerClick() {
      if (this.isMobile) {
        this.drawer = !this.drawer;
      }
    },

    checkScreenSize() {
      this.isMobile = window.innerWidth < 960;
      if (this.isMobile) {
        this.drawer = false;
      }
    },

    selectChat(chat) {
      this.selectedChat = chat;
      if (this.isMobile) {
        this.drawer = false;
      }
    },

    formatTime(date) {
      if (!date) return '';
      return new Date(date).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    },

    async sendMessage() {
      if (!this.userPrompt.trim()) return;

      this.processingPrompt = true;
      
      // Add user message with current timestamp
      this.messages.push({
        content: this.userPrompt,
        isUser: true,
        timestamp: new Date(),
      });

      // Store the prompt before clearing
      const userPrompt = this.userPrompt;
      this.userPrompt = "";

      try {
        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.messages.push({
          content: "This is a simulated response to: " + userPrompt,
          isUser: false,
          timestamp: new Date(),
        });
      } finally {
        this.processingPrompt = false;
        this.scrollToBottom();
      }
    },

    scrollToBottom() {
      setTimeout(() => {
        const chatMessages = document.querySelector(".chat-messages");
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 100);
    },

    openFileDialog() {
      this.showFileDialog = true;
    },

    attachFiles() {
      // Here you would handle the selected transcriptions
      console.log('Selected transcriptions:', this.selectedTranscriptions);
      this.showFileDialog = false;
    },
  },
};
</script>

<style scoped>
.chat-container {
  position: relative;
}

.mobile-chat-container {
  height: calc(100vh - 130px);
}

.desktop-chat-container {
  height: calc(100vh - 110px);
}

.mobile-app-bar {
  position: fixed !important;
  left: 0;
  right: 0;
  z-index: 100;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  position: absolute;
  top: 0;
  bottom: 120px;
  left: 0;
  right: 0;
  scroll-behavior: smooth;
}

.prompt-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.prompt-wrapper {
  min-height: 40px;
  position: relative;
}

.prompt-textarea {
  flex-grow: 1;
}

.prompt-textarea :deep(.v-field__input) {
  min-height: 24px !important;
  padding: 4px 0 !important;
}

.prompt-textarea :deep(.v-field) {
  --v-field-padding-bottom: 0 !important;
  --v-field-padding-top: 0 !important;
}

.prompt-actions {
  padding: 4px 0;
}

.chat-messages-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-wrapper {
  padding: 1rem;
  border-radius: 8px;
  margin: 0 48px;
}

.user-message {
  background: #E3F2FD;
  margin-left: 96px;
}

.ai-message {
  background: white;
  margin-right: 96px;
  border: 1px solid #e0e0e0;
}

.prompt-textarea :deep(.v-field__input) {
  min-height: 24px !important;
  padding: 4px 0 !important;
}

.prompt-textarea :deep(.v-field) {
  --v-field-padding-bottom: 0 !important;
  --v-field-padding-top: 0 !important;
}

/* Add responsive styles */
@media (max-width: 600px) {
  .message-wrapper {
    margin: 0 16px;
  }
  
  .user-message {
    margin-left: 32px;
  }
  
  .ai-message {
    margin-right: 32px;
  }
}
</style>
