function App() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="card p-8 max-w-md mx-auto text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-primary-700 mb-2">Nomadly</h1>
          <p className="text-gray-600">Your Travel Planning Companion</p>
        </div>
        
        <div className="space-y-4">
          
          
          <div className="flex gap-2">
            <button className="btn-primary flex-1">Login</button>
            <button className="btn-secondary flex-1">Sign Up</button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App
