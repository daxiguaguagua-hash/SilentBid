import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import AuctionDetail from './pages/AuctionDetail';
import Dashboard from './pages/Dashboard';

export { parseBidAmount } from './lib/bids';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="lobby" element={<Lobby />} />
          <Route path="auction/:id" element={<AuctionDetail />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
