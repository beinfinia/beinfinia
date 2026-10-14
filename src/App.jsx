import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InfiniaLanding from './components/InfiniaLanding';
import InfiniaOps, { Booking } from './pages/InfiniaOps';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/panel/*" element={<InfiniaOps />} />
        <Route path="/cita" element={<Booking />} />
        <Route path="/" element={<InfiniaLanding />} />
        <Route path="/politica-de-privacidad" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

