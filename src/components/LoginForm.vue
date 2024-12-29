<template>
    <div>
        <div class="company-brand pa-4">
            <div class="d-flex align-center">
                <v-img
                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzI1NjNlYiIvPjxwYXRoIGQ9Ik0xMiAyMGgxNk0yMCAxMnYxNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSI0Ii8+PC9zdmc+"
                    width="40" height="40" class="me-3" contain />
                <span class="text-h6 font-weight-bold text-primary">Company Name</span>
            </div>
        </div>
        <v-container class="fill-height auth-background">
            <v-row justify="center" align="center">
                <v-col cols="12" sm="8" md="6" lg="4">
                    <v-card class="elevation-3 rounded-lg">
                        <v-card-title class="text-h4 text-center pt-6 font-weight-medium">
                            Welcome Back
                        </v-card-title>
                        <v-card-subtitle class="text-center pb-4">
                            Login to your account
                        </v-card-subtitle>

                        <v-card-text>
                            <!-- Google Sign In Button -->
                            <div class="mb-4 g-signin2 d-flex justify-center ">
                                <GoogleLogin :callback="handleGoogleLogin" />
                            </div>

                            <div class="text-center my-4">
                                <v-divider class="my-4">
                                    <span class="text-medium-emphasis">OR</span>
                                </v-divider>
                            </div>

                            <v-form @submit.prevent="handleSubmit" v-model="isFormValid" ref="loginForm">
                                <v-text-field v-model="formData.email" label="Email" type="email"
                                    :rules="validationRules.emailRules" required prepend-inner-icon="mdi-email"
                                    variant="outlined" density="comfortable" class="mb-2" />

                                <v-text-field v-model="formData.password" label="Password"
                                    :type="showPassword ? 'text' : 'password'" :rules="validationRules.passwordRules"
                                    required prepend-inner-icon="mdi-lock"
                                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                    @click:append-inner="togglePassword" variant="outlined" density="comfortable"
                                    class="mb-4" />

                                <v-btn color="primary" block size="large" type="submit" :loading="loading"
                                    :disabled="!isFormValid" class="mb-4">
                                    Login
                                </v-btn>

                                <div class="text-center mb-4">
                                    Don't have an account?
                                    <router-link to="/signup" class="text-primary font-weight-medium">Sign
                                        up</router-link>
                                </div>
                            </v-form>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import { GoogleLogin } from 'vue3-google-login'

/**
 * @component LoginForm
 * @description Handles user authentication through email and password
 */
export default {
    name: 'LoginForm',

    components: {
        GoogleLogin
    },

    data() {
        return {
            /** @type {{ email: string, password: string }} Form input data */
            formData: {
                email: '',
                password: ''
            },
            /** @type {boolean} Toggle for password visibility */
            showPassword: false,
            /** @type {boolean} Loading state for form submission */
            loading: false,
            /** @type {boolean} Form validation state */
            isFormValid: false,
            /** @type {Object} Validation rules for form fields */
            validationRules: {
                /** @type {Array<Function>} Email validation rules */
                emailRules: [
                    v => !!v || 'Email is required',
                    v => /.+@.+\..+/.test(v) || 'Email must be valid'
                ],
                /** @type {Array<Function>} Password validation rules */
                passwordRules: [
                    v => !!v || 'Password is required',
                    v => v?.length >= 8 || 'Password must be at least 8 characters'
                ]
            }
        }
    },

    methods: {
        /**
         * Toggles password field visibility between text and password type
         * @returns {void}
         */
        togglePassword() {
            this.showPassword = !this.showPassword
        },

        /**
         * Handles form submission for login
         * @async
         * @returns {Promise<void>}
         * @throws {Error} When login API call fails
         */
        async handleSubmit() {
            const isValid = await this.$refs.loginForm.validate()

            if (isValid) {
                try {
                    this.loading = true
                    // Implement your login logic here
                    console.log('Login attempt:', this.formData)

                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000))

                    // On success, redirect or show success message
                    this.$router.push('/dashboard')
                } catch (error) {
                    console.error('Login failed:', error)
                } finally {
                    this.loading = false
                }
            }
        },

        /**
         * Handles Google login
         * @async
         * @returns {Promise<void>}
         * @throws {Error} When Google login fails
         */
        async handleGoogleLogin(response) {
            try {
                console.log('Google login response:', response)
                // Here you would:
                // 1. Send the response.credential to your backend
                // 2. Get your app's auth token back
                // 3. Store it in your auth store/local storage
                
                // Redirect to dashboard
                this.$router.push('/dashboard')
            } catch (error) {
                console.error('Google login failed:', error)
                // Handle login error
            }
        }
    }
}
</script>

<style scoped>

.auth-background {
    background: linear-gradient(135deg, var(--v-background-base) 0%, var(--v-surface-base) 100%);
    min-height: 100vh;
    position: relative;
    /* Added for absolute positioning of company brand */
}
.company-brand {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
}


:deep(.v-field) {
    border-radius: 12px;
}

:deep(.v-field__outline__start) {
    border-radius: 12px 0 0 12px;
}

:deep(.v-field__outline__end) {
    border-radius: 0 12px 12px 0;
}

:deep(.v-btn) {
    text-transform: none;
    letter-spacing: 0.5px;
}
</style>