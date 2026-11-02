import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Home } from "lucide-react"

export function NotFoundPage() {
  const navigate = useNavigate()

  const handleBackToDashboard = () => {
    navigate({ to: '/' })
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      handleBackToDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <p className="text-2xl font-semibold text-gray-700 mt-[-40px]">
            Page Not Found
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
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
