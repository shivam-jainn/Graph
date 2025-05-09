import { createAuthClient } from "better-auth/react"

export const { signIn, signUp, useSession, getSession, signOut } = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL
})