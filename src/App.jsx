import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ApiTesting from './components/ApiTesting'
import Header from './components/Header'
import Footer from './components/Footer'
import Onderwijsdoelen from './components/Onderwijsdoelen'
import AnalyzerPage from './corefunctionality/analyzerpage/AnalyzerPage'
import Home from './components/Home'

function App() {
  return (
    <Router>
      <div>
        <Header />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyzer" element={<AnalyzerPage />} />
          <Route path="/api-testing" element={<ApiTesting />} />
          <Route path="/onderwijsdoelen" element={<Onderwijsdoelen />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
