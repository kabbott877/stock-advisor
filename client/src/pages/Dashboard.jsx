import { useState } from 'react';
import axios from 'axios';
import ScanResults from '../components/ScanResults';
import SymbolDetail from '../components/SymbolDetail';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Dashboard({ token }) {
  const [scanResults, setScanResults] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runScan = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/api/scan`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setScanResults(response.data.results);
    } catch (err) {
      setError(err.response?.data?.error || 'Scan failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSymbolSelect = (symbol) => {
    setSelectedSymbol(symbol);
  };

  const handleCloseDetail = () => {
    setSelectedSymbol(null);
  };

  return (
    <div className="dashboard">
      <div className="scan-controls">
        <button
          className="scan-button"
          onClick={runScan}
          disabled={loading}
        >
          {loading ? 'Scanning...' : 'Run Scan'}
        </button>
        {error && <div className="error">{error}</div>}
      </div>

      {scanResults.length > 0 && (
        <ScanResults
          results={scanResults}
          onSelect={handleSymbolSelect}
        />
      )}

      {selectedSymbol && (
        <SymbolDetail
          symbol={selectedSymbol}
          token={token}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

export default Dashboard;
