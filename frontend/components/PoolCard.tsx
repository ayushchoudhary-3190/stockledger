import { Pool } from '../lib/api';

interface PoolCardProps {
  pool: Pool;
}

export default function PoolCard({ pool }: PoolCardProps) {
  const colors: Record<string, string> = {
    AAPL: '#ffd700',
    TSLA: '#ff4757',
    MSFT: '#00ff88',
  };

  const color = colors[pool.symbol] || '#00d4ff';

  return (
    <div style={{ ...styles.card, borderColor: color }}>
      <div style={styles.header}>
        <h3 style={{ ...styles.symbol, color }}>{pool.symbol}</h3>
        <span style={styles.price}>${pool.price.toFixed(2)}</span>
      </div>

      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statLabel}>USD Reserve</span>
          <span style={styles.statValue}>${pool.usd_reserve.toLocaleString()}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Stock Reserve</span>
          <span style={styles.statValue}>{pool.stock_reserve.toFixed(2)}</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statLabel}>Fee Tier</span>
          <span style={styles.statValue}>{(pool.fee_tier * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div style={styles.progress}>
        <div
          style={{
            ...styles.progressBar,
            width: `${Math.min((pool.usd_reserve / 200000) * 100, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  card: {
    backgroundColor: '#16213e',
    padding: '1.5rem',
    borderRadius: '12px',
    borderLeft: '4px solid',
    margin: '0.5rem 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  symbol: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
  },
  price: {
    color: '#00d4ff',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  },
  stat: {
    textAlign: 'center',
  },
  statLabel: {
    display: 'block',
    color: '#aaa',
    fontSize: '0.8rem',
    marginBottom: '0.25rem',
  },
  statValue: {
    color: 'white',
    fontWeight: 'bold',
  },
  progress: {
    height: '4px',
    backgroundColor: '#1a1a2e',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
};