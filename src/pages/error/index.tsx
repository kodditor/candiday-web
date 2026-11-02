import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

interface ErrorComponentProps {
  error: Error
  reset: () => void
}

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const navigate = useNavigate()

  const handleBackToDashboard = () => {
    // Reset the router error state first
    reset()
    navigate({ to: '/' })
  }

  const handleGoBack = () => {
    // Try to go back in history, if that fails go to dashboard
    if (window.history.length > 1) {
      window.history.back()
    } else {
      handleBackToDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Error Visual */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">Error</h1>
          <p className="text-2xl font-semibold text-gray-700 mt-[-30px]">
            Something went wrong
          </p>
        </div>

        {/* Error Message */}
        <p className="text-gray-500 mb-8">
          {error.message || 'An unexpected error occurred'}
        </p>

        {import.meta.env.DEV && error.stack && (
          <pre className="text-xs bg-gray-100 p-3 rounded-md text-left overflow-auto max-h-40 mb-8">
            {error.stack}
          </pre>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          
          <Button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <Home size={18} />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
