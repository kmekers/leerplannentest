import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Analyzer from './components/Analyzer'
import ApiTesting from './components/ApiTesting'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  return (
    <Router>
      <div>
        <Header />
        
        <Routes>
          <Route path="/" element={
            <main className="main">
              <div className="card">
                <h1 className="title">
                  Welcome to AI Teacher Assistant
                </h1>
                <p className="subtitle">
                  Select an option from the navigation bar to get started.
                </p>
              </div>
            </main>
          } />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/api-testing" element={<ApiTesting />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
