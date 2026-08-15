import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function SymbolDetail({ symbol, token, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResearch();
  }, [symbol]);

  const fetchResearch = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/api/research/${symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setResearch(response.data.research);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch research');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'fundamentals', label: 'Fundamentals' },
    { id: 'signal', label: 'Signal' },
    { id: 'news', label: 'News' },
    { id: 'risk', label: 'Risk' }
  ];

  if (loading) {
    return (
      <div className="symbol-detail">
        <div className="detail-header">
          <h2>{symbol}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="loading">Loading research...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="symbol-detail">
        <div className="detail-header">
          <h2>{symbol}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="symbol-detail">
      <div className="detail-header">
        <h2>{symbol}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && research.overview && (
          <div className="overview">
            <div className="stat-grid">
              <div className="stat">
                <label>Current Price</label>
                <value>${research.overview.currentPrice}</value>
              </div>
              <div className="stat">
                <label>30-Day ATR</label>
                <value>${research.overview.atr30Day}</value>
              </div>
              <div className="stat">
                <label>Earnings Move</label>
                <value className={research.overview.earningsMove >= 0 ? 'positive' : 'negative'}>
                  {research.overview.earningsMove > 0 ? '+' : ''}{research.overview.earningsMove}%
                </value>
              </div>
              <div className="stat">
                <label>Move vs ATR</label>
                <value className={research.overview.moveVsATR >= 2 ? 'high-ratio' : ''}>
                  {research.overview.moveVsATR}x
                </value>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'earnings' && research.earnings && (
          <div className="earnings">
            <div className="earnings-comparison">
              <div className="stat">
                <label>Actual EPS</label>
                <value>${research.earnings.actualEPS}</value>
              </div>
              <div className="stat">
                <label>Estimated EPS</label>
                <value>${research.earnings.estimatedEPS}</value>
              </div>
              <div className="stat">
                <label>Guidance Changed</label>
                <value className={research.earnings.guidanceChanged ? 'warning' : ''}>
                  {research.earnings.guidanceChanged ? 'Yes' : 'No'}
                </value>
              </div>
            </div>
            {research.earnings.oneTimeItems.length > 0 && (
              <div className="one-time-items">
                <h4>One-Time Items</h4>
                <ul>
                  {research.earnings.oneTimeItems.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'fundamentals' && research.fundamentals && (
          <div className="fundamentals">
            <div className="stat-grid">
              <div className="stat">
                <label>Revenue Mix</label>
                <value>
                  Products: {research.fundamentals.revenueBreakdown.products}%
                  Services: {research.fundamentals.revenueBreakdown.services}%
                </value>
              </div>
              <div className="stat">
                <label>TAM</label>
                <value>{research.fundamentals.tam}</value>
              </div>
              <div className="stat">
                <label>Churn Rate</label>
                <value>{research.fundamentals.churnRate}%</value>
              </div>
              <div className="stat">
                <label>Growth Rate</label>
                <value className="positive">{research.fundamentals.growthRate}%</value>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'signal' && research.signal && (
          <div className="signal">
            <div className="signal-type">
              <h3>Signal: {research.signal.type}</h3>
              <div className="confidence">
                Confidence: {(research.signal.confidence * 100).toFixed(0)}%
              </div>
            </div>
            <div className="reasoning">
              <h4>Reasoning</h4>
              <p>{research.signal.reasoning}</p>
            </div>
          </div>
        )}

        {activeTab === 'news' && research.news && (
          <div className="news">
            {research.news.map((item, index) => (
              <div key={index} className="news-item">
                <div className="headline">{item.headline}</div>
                <div className="time">{item.time}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'risk' && research.risk && (
          <div className="risk">
            <div className="risk-metrics">
              <div className="stat">
                <label>Position Size</label>
                <value>{research.risk.suggestedPositionSize}</value>
              </div>
              <div className="stat">
                <label>Suggested Stop</label>
                <value>{research.risk.suggestedStop}</value>
              </div>
            </div>
            <div className="tail-risk">
              <h4>Tail Risk Warning</h4>
              <p>{research.risk.tailRiskWarning}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SymbolDetail;
