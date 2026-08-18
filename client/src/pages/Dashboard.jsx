import { useState } from 'react';
import axios from 'axios';
import ScanResults from '../components/ScanResults';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Dashboard({ token }) {
  const [scanResults, setScanResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const runScan = async (isRetry = false) => {
    setLoading(true);
    setError('');
    if (isRetry) {
      setRetryCount(prev => prev + 1);
    }

    try {
      const response = await axios.get(`${API_URL}/api/scan`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 300000 // 5 minutes for slow API calls
      });

      setScanResults(response.data.results);
      setRetryCount(0);
    } catch (err) {
      let errorMessage = 'Scan failed';

      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Scan timed out. The API may be slow — try again.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Rate limited. Wait a moment and try again.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (!err.response) {
        errorMessage = 'Network error. Check your connection.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    runScan(true);
  };

  return (
    <div className="dashboard">
      <div className="scan-controls">
        <button
          className="scan-button"
          onClick={() => runScan()}
          disabled={loading}
        >
          {loading ? 'Scanning...' : 'Run Scan'}
        </button>
      </div>

      {error && (
        <div className="error">
          <div className="error-retry">
            <span>{error}</span>
            <button onClick={handleRetry} disabled={loading}>
              Retry
            </button>
          </div>
          {retryCount > 2 && (
            <small style={{ display: 'block', marginTop: '0.5rem', opacity: 0.7 }}>
              Multiple retries failed. Check API status or try again later.
            </small>
          )}
        </div>
      )}

      {loading && scanResults.length === 0 && (
        <div className="scan-results">
          <div className="results-header">
            <h2>Scanning...</h2>
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-row">
              <div className="skeleton skeleton-cell"></div>
              <div className="skeleton skeleton-cell"></div>
              <div className="skeleton skeleton-cell"></div>
              <div className="skeleton skeleton-cell"></div>
              <div className="skeleton skeleton-cell"></div>
              <div className="skeleton skeleton-cell"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && scanResults.length === 0 && !error && (
        <div className="scan-results">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No scan results yet</h3>
            <p>Click "Run Scan" to find earnings overreaction candidates</p>
          </div>
        </div>
      )}

      {scanResults.length > 0 && (
        <ScanResults
          results={scanResults}
          token={token}
        />
      )}
    </div>
  );
}

export default Dashboard;
