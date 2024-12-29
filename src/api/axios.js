import axios from 'axios'

// Instance for file uploads (multipart/form-data)
export const uploadClient = axios.create({
  baseURL: 'http://18.189.195.46',
  headers: {
    'Content-Type': 'multipart/form-data',
  }
})

// Instance for regular JSON requests
export const apiClient = axios.create({
  baseURL: 'http://18.189.195.46',
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add response interceptor for error handling
const handleError = (error) => {
  if (error.response) {
    // Server responded with error status
    console.error('Response error:', error.response.data)
    throw error.response.data
  } else if (error.request) {
    // Request made but no response
    console.error('Request error:', error.request)
    throw new Error('No response from server')
  } else {
    // Other errors
    console.error('Error:', error.message)
    throw error
  }
}

uploadClient.interceptors.response.use(response => response, handleError)
apiClient.interceptors.response.use(response => response, handleError) 