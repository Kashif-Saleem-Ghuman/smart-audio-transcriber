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
            <!-- Company Logo and Name in top left -->


            <v-row justify="center" align="center">
                <v-col cols="12" sm="8" md="6" lg="4">
                    <div class="text-center mb-6">
                        <h1 class="text-h4 font-weight-bold text-primary mb-2">
                            Create Account
                        </h1>
                        <p class="text-body-1 text-medium-emphasis">
                            Fill in your details to get started
                        </p>
                    </div>

                    <v-card class="pa-4 auth-card">
                        <v-card-text>
                            <!-- Add Google Sign Up Button -->
                            <div class="d-flex justify-center mb-4">
                                <GoogleLogin :callback="handleGoogleSignup" />
                            </div>

                            <div class="text-center my-4">
                                <v-divider class="my-4">
                                    <span class="text-medium-emphasis">OR</span>
                                </v-divider>
                            </div>

                            <v-form @submit.prevent="handleSubmit" v-model="isFormValid" ref="signupForm">
                                <v-text-field v-model="formData.firstName" label="First Name"
                                    :rules="validationRules.requiredRule" required prepend-inner-icon="mdi-account"
                                    class="mb-3" />

                                <v-text-field v-model="formData.lastName" label="Last Name"
                                    :rules="validationRules.requiredRule" required prepend-inner-icon="mdi-account"
                                    class="mb-3" />

                                <v-text-field v-model="formData.email" label="Email" type="email"
                                    :rules="validationRules.emailRules" required prepend-inner-icon="mdi-email"
                                    class="mb-3" />

                                <v-text-field v-model="formData.password" label="Password"
                                    :type="showPassword ? 'text' : 'password'" :rules="validationRules.passwordRules"
                                    required prepend-inner-icon="mdi-lock"
                                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                                    @click:append-inner="togglePassword" class="mb-3" />

                                <!-- <v-select v-model="formData.country" :items="countries" label="Country"
                                    :rules="validationRules.requiredRule" required prepend-inner-icon="mdi-earth"
                                    class="mb-3" />

                                <v-text-field v-model="formData.phone" label="Phone Number" type="tel"
                                    :rules="validationRules.phoneRules" required prepend-inner-icon="mdi-phone"
                                    class="mb-6" /> -->

                                <v-btn color="primary" block type="submit" :loading="loading" :disabled="!isFormValid"
                                    class="mb-4">
                                    Create Account
                                </v-btn>

                                <div class="text-center text-body-2">
                                    Already have an account?
                                    <router-link to="/login"
                                        class="font-weight-medium text-primary text-decoration-none">
                                        Sign in instead
                                    </router-link>
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
/**
 * @component SignupForm
 * @description Handles new user registration with comprehensive user details
 */
import { GoogleLogin } from 'vue3-google-login'

export default {
    name: 'SignupForm',

    components: {
        GoogleLogin
    },

    data() {
        return {
            /** 
             * @type {Object} Form input data
             * @property {string} firstName - User's first name
             * @property {string} lastName - User's last name
             * @property {string} email - User's email address
             * @property {string} password - User's password
             * @property {string|null} country - Selected country
             * @property {string} phone - User's phone number
             */
            formData: {
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                country: null,
                phone: ''
            },
            /** @type {boolean} Toggle for password visibility */
            showPassword: false,
            /** @type {boolean} Loading state for form submission */
            loading: false,
            /** @type {boolean} Form validation state */
            isFormValid: false,
            /** @type {Array<string>} List of available countries */
            countries: [
                'United States',
                'United Kingdom',
                'Canada',
                'Australia',
                'Germany',
                'France',
                'Japan',
            ],
            /** @type {Object} Validation rules for form fields */
            validationRules: {
                /** @type {Array<Function>} Required field validation */
                requiredRule: [
                    v => !!v || 'This field is required'
                ],
                /** @type {Array<Function>} Email validation rules */
                emailRules: [
                    v => !!v || 'Email is required',
                    v => /.+@.+\..+/.test(v) || 'Email must be valid'
                ],
                /** @type {Array<Function>} Password validation rules */
                passwordRules: [
                    v => !!v || 'Password is required',
                    v => v?.length >= 8 || 'Password must be at least 8 characters'
                ],
                /** @type {Array<Function>} Phone number validation rules */
                phoneRules: [
                    v => !!v || 'Phone number is required',
                    v => /^\+?[\d\s-]{8,}$/.test(v) || 'Please enter a valid phone number'
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
         * Handles form submission for user registration
         * @async
         * @returns {Promise<void>}
         * @throws {Error} When signup API call fails
         */
        async handleSubmit() {
            const isValid = await this.$refs.signupForm.validate()

            if (isValid) {
                try {
                    this.loading = true
                    // Implement your signup logic here
                    console.log('Signup attempt:', this.formData)

                    // Simulate API call
                    await new Promise(resolve => setTimeout(resolve, 1000))

                    // On success, redirect to login
                    this.$router.push('/login')
                } catch (error) {
                    console.error('Signup failed:', error)
                } finally {
                    this.loading = false
                }
            }
        },

        /**
         * Handles Google signup
         * @async
         * @param {Object} response - Google OAuth response
         * @returns {Promise<void>}
         */
        async handleGoogleSignup(response) {
            try {
                console.log('Google signup response:', response)
                // Here you would:
                // 1. Send the response.credential to your backend
                // 2. Create a new user account if needed
                // 3. Get your app's auth token back
                // 4. Store it in your auth store/local storage
                
                // Redirect to dashboard
                this.$router.push('/dashboard')
            } catch (error) {
                console.error('Google signup failed:', error)
                // Handle signup error
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

.auth-card {
    border: 1px solid #e2e8f0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
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