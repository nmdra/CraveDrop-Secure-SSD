import { useState } from 'react'
import axios from 'axios'
import { useAuthContext } from './useAuthContext'
import { useNavigate } from 'react-router-dom'

export const useLogin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()
    const navigate = useNavigate()

    const login = async (email, password) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await axios.post(
                '/api/user/auth',
                { email, password },
                { withCredentials: true }
            )

            const { user } = response.data

            // Store only non-sensitive display information.
            localStorage.setItem('user', JSON.stringify(user))

            dispatch({ type: 'LOGIN', payload: user })

            setIsLoading(false)
            navigate('/dashboard')
        } catch (error) {
            console.error(error)
            if (
                error.response &&
                error.response.data &&
                error.response.data.message
            ) {
                setError(error.response.data.message)
            } else {
                setError('Internal server error. Please try again later.')
            }
            setIsLoading(false)
        }
    }

    return { error, isLoading, login }
}
