import { useState } from 'react';

function ScanResults({ results, onSelect }) {
  const [sortField, setSortField] = useState('atrRatio');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filter, setFilter] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredResults = results
    .filter(result =>
      result.symbol.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return (aVal - bVal) * modifier;
    });

  const getSortIndicator = (field) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

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
            <tr key={result.symbol}>
              <td className="symbol">{result.symbol}</td>
              <td>{result.earningsDate}</td>
              <td className={result.movePercent >= 0 ? 'positive' : 'negative'}>
                {result.movePercent > 0 ? '+' : ''}{result.movePercent}%
              </td>
              <td className={result.atrRatio >= 2 ? 'high-ratio' : ''}>
                {result.atrRatio}x
              </td>
              <td className={result.fundamentalChange ? 'warning' : ''}>
                {result.fundamentalChange ? 'Yes' : 'No'}
              </td>
              <td>
                <button
                  className="research-button"
                  onClick={() => onSelect(result.symbol)}
                >
                  Research
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredResults.length === 0 && (
        <div className="no-results">
          {filter ? 'No symbols match filter' : 'No results found'}
        </div>
      )}
    </div>
  );
}

export default ScanResults;
