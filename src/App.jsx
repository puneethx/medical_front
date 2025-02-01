import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AudioTranscription from './AudioTranscription'
import Diarization from './components/Diarization'
// import AudioTranscription from './page'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AudioTranscription />} />
                <Route path="/diarization" element={<Diarization />} />
            </Routes>
        </Router>
    )
}

export default App



