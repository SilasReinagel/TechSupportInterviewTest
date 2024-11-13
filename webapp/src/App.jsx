import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './components/Home'
import Accounts from './components/Accounts'
import SqlExecution from './components/SqlExecution'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 fixed w-full z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-800">ByteBounce</h1>
            </div>
            <div className="flex items-center">
              <button className="flex items-center text-gray-500 hover:text-gray-700">
                <span className="mr-2">JC Denton</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 pt-16">
          {/* Sidebar */}
          <aside className={`bg-white border-r border-gray-200 text-gray-600 w-64 fixed h-full transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-64'
          }`}>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="flex items-center p-2 rounded hover:bg-gray-100">
                    <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/accounts" className="flex items-center p-2 rounded hover:bg-gray-100">
                    <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Accounts
                  </Link>
                </li>
                <li>
                  <Link to="/sql" className="flex items-center p-2 rounded hover:bg-gray-100">
                    <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    SQL Execution
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className={`flex-1 bg-gray-100 p-6 transition-all duration-300 ${
            isSidebarOpen ? 'ml-64' : 'ml-0'
          }`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/sql" element={<SqlExecution />} />
            </Routes>
          </main>
        </div>

        {/* Footer */}
        <footer className={`bg-white border-t border-gray-200 p-4 text-center text-gray-600 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          <p>&copy; 2024 ByteBounce. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
