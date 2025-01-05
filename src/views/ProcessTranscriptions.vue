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
      <v-col class="d-flex flex-column pa-0 chat-container">
        <!-- Mobile Menu Button -->
        <v-app-bar v-if="isMobile" density="compact">
          <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
          <v-toolbar-title>Chat History</v-toolbar-title>
        </v-app-bar>

        <!-- Chat Messages Area -->
        <div class="chat-messages">
          <v-col class="pa-4">
            <!-- Chat messages container -->
            <div class="chat-messages-container">
              <div
                v-for="(message, index) in messages"
                :key="index"
                :class="[
                  'message-wrapper',
                  message.isUser ? 'user-message' : 'ai-message',
                ]"
              >
                <div class="message-content">
                  <div v-if="!message.isUser" class="ai-avatar">
                    <v-icon size="30" color="primary">mdi-robot</v-icon>
                  </div>
                  <div class="message-text" v-html="message.content"></div>
                </div>
              </div>
            </div>
          </v-col>
        </div>

        <!-- Prompt Input Area -->
        <div class="prompt-area px-6 mx-1 mb-6">
          <v-row class="pa-2 bg-grey-lighten-2 rounded-lg">
            <v-col>
              <v-textarea
                v-model="userPrompt"
                rows="1"
                auto-grow
                variant="flat"
                hide-details
                placeholder="Type your message here..."
                class="prompt-textarea"
                density="comfortable"
                max-rows="4"
              >
                <template v-slot:append>
                  <v-btn
                    color="primary"
                    icon="mdi-send"
                    @click="sendMessage"
                    size="small"
                  ></v-btn>
                </template>
              </v-textarea>
            </v-col>
          </v-row>
        </div>
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
        },
        {
          content: "How is the weather in Pakistan?",
          isUser: true,
        },
        {
          content:
            "The weather in Pakistan is generally hot and sunny, with temperatures ranging from 25°C to 35°C during the day. The weather is influenced by the monsoon season, which typically occurs from June to September. During this time, the country experiences heavy rainfall and thunderstorms. It is advisable to carry light clothing, sunglasses, and sunscreen when traveling to Pakistan.",
          isUser: false,
        },
        {
          content: "What is the capital of Pakistan?",
          isUser: true,
        },
        {
          content: "The capital of Pakistan is Islamabad.",
          isUser: false,
        },
        {
          content: "What is the population of Pakistan?",
          isUser: true,
        },
        {
          content:
            "The population of Pakistan is approximately 220 million people.",
          isUser: false,
        },
        {
          content: "What is the official language of Pakistan?",
          isUser: true,
        },
        {
          content: "The official language of Pakistan is Urdu.",
          isUser: false,
        },
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

    sendMessage() {
      if (!this.userPrompt.trim()) return;

      // Add user message
      this.messages.push({
        content: this.userPrompt,
        isUser: true,
      });

      // Clear input
      this.userPrompt = "";

      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        this.messages.push({
          content:
            "This is a simulated response from the AI. You would replace this with actual API response.",
          isUser: false,
        });
        this.scrollToBottom();
      }, 1000);
    },

    scrollToBottom() {
      setTimeout(() => {
        const chatMessages = document.querySelector(".chat-messages");
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }, 100);
    },
  },
};
</script>

<style scoped>
.chat-container {
  height: calc(100vh - 80px);
  position: relative;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  position: absolute;
  top: 0;
  bottom: 140px; /* Reduced from 180px */
  left: 0;
  right: 0;
  /* Add padding to top if mobile app bar is present */
  padding-top: v-bind(isMobile ? "48px": "0");
  scroll-behavior: smooth;
}

.prompt-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  /* Add subtle shadow to separate from chat */
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.prompt-textarea :deep(.v-field__input) {
  height: 40px !important; /* Reduced from 55px */
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

.chat-messages-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-content {
  display: flex;
  gap: 1rem;
  max-width: 80%;
}

.user-message {
  justify-content: flex-end;
}

.user-message .message-content {
  flex-direction: row-reverse;
}

.message-text {
  padding: 1rem;
  font-size: 0.9375rem;
  line-height: 1.4;
}

.user-message .message-text {
  background-color: rgb(var(--v-theme-primary));
  color: white;
  border-radius: 8px;
}

.ai-message .message-text {
  background: transparent;
}

.ai-avatar {
  display: flex;
  align-items: flex-start;
  padding-top: 0.25rem;
}
</style>
