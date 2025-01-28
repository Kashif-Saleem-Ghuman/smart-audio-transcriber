import { defineStore } from 'pinia'

export const useBlogStore = defineStore('blog', {
  state: () => ({
    outline: null,
    article: null,
    loading: false,
    selectedTranscriptions: [],
  }),

  actions: {
    async generateOutline(params) {
      this.loading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        this.outline = {
          intro: { 
            title: 'Introduction',
            level: 'H1',
            content: '' 
          },
          sections: [
            {
              id: 'h2_1',
              level: 'H2',
              title: 'Influential Leadership and Policies',
              content: '',
              subsections: [
                {
                  id: 'h3_1',
                  level: 'H3',
                  title: 'George Washington: Setting Precedents',
                  content: ''
                },
                {
                  id: 'h3_2',
                  level: 'H3',
                  title: 'Abraham Lincoln: Preserving the Union',
                  content: ''
                },
                {
                  id: 'h3_3',
                  level: 'H3',
                  title: 'Franklin D. Roosevelt: New Deal and WWII',
                  content: ''
                }
              ]
            },
            {
              id: 'h2_2',
              level: 'H2',
              title: 'Legacy and Impact on Society',
              content: '',
              subsections: [
                {
                  id: 'h3_4',
                  level: 'H3',
                  title: 'Thomas Jefferson: Expansion and Enlightenment',
                  content: ''
                },
                {
                  id: 'h3_5',
                  level: 'H3',
                  title: 'Theodore Roosevelt: Progressive Reforms',
                  content: ''
                }
              ]
            }
          ]
        }
      } finally {
        this.loading = false
      }
    },

    async generateArticle() {
      this.loading = true
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        this.article = "Generated article content..."
      } finally {
        this.loading = false
      }
    }
  }
}) 