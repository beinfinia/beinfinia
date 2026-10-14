import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InfiniaLanding from './components/InfiniaLanding';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InfiniaLanding />} />
        <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
