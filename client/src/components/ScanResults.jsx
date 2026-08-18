import React, { useState } from 'react';
import SymbolDetail from './SymbolDetail';

function ScanResults({ results, token }) {
  const [sortField, setSortField] = useState('atrRatio');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filter, setFilter] = useState('');
  const [expandedSymbol, setExpandedSymbol] = useState(null);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleToggle = (symbol) => {
    setExpandedSymbol(expandedSymbol === symbol ? null : symbol);
  };

  const filteredResults = results
    .filter(result =>
      result.symbol.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;

      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return (aVal - bVal) * modifier;
    });

  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const columns = 6;

  return (
    <div className="scan-results">
      <div className="results-header">
        <h2>Scan Results ({filteredResults.length})</h2>
        <input
          type="text"
          placeholder="Filter by symbol..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('symbol')}>
              Symbol{getSortIndicator('symbol')}
            </th>
            <th onClick={() => handleSort('earningsDate')}>
              Earnings Date{getSortIndicator('earningsDate')}
            </th>
            <th onClick={() => handleSort('movePercent')}>
              Move %{getSortIndicator('movePercent')}
            </th>
            <th onClick={() => handleSort('atrRatio')}>
              ATR Ratio{getSortIndicator('atrRatio')}
            </th>
            <th onClick={() => handleSort('fundamentalChange')}>
              Fundamental Change{getSortIndicator('fundamentalChange')}
            </th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredResults.map((result) => (
            <React.Fragment key={result.symbol}>
              <tr className={`${expandedSymbol === result.symbol ? 'expanded-row' : ''} ${result.flagged ? 'flagged-row' : ''}`}>
                <td className="symbol" data-label="Symbol">
                  {result.symbol}
                  {result.flagged && <span className="flag-badge" title="Overreaction candidate (>1.5x ATR)">⚡</span>}
                </td>
                <td data-label="Earnings Date">{result.earningsDate}</td>
                <td className={result.movePercent >= 0 ? 'positive' : 'negative'} data-label="Move %">
                  {result.movePercent !== null
                    ? `${result.movePercent > 0 ? '+' : ''}${result.movePercent}%`
                    : '—'}
                </td>
                <td className={result.atrRatio >= 2 ? 'high-ratio' : ''} data-label="ATR Ratio">
                  {result.atrRatio !== null ? `${result.atrRatio}x` : '—'}
                </td>
                <td className={result.fundamentalChange ? 'warning' : ''} data-label="Fundamental Change">
                  {result.fundamentalChange ? 'Yes' : 'No'}
                </td>
                <td data-label="Action">
                  <button
                    className={`research-button ${expandedSymbol === result.symbol ? 'active' : ''}`}
                    onClick={() => handleToggle(result.symbol)}
                  >
                    {expandedSymbol === result.symbol ? 'Close' : 'Research'}
                  </button>
                </td>
              </tr>
              {expandedSymbol === result.symbol && (
                <tr className="detail-row">
                  <td colSpan={columns}>
                    <SymbolDetail
                      symbol={result.symbol}
                      token={token}
                      onClose={() => setExpandedSymbol(null)}
                    />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {filteredResults.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>{filter ? 'No symbols match filter' : 'No results found'}</h3>
          <p>{filter ? 'Try a different search term' : 'Run a scan to see results'}</p>
        </div>
      )}
    </div>
  );
}

export default ScanResults;
