import { User } from '../lib/api';

interface WalletDisplayProps {
  user: User;
}

export default function WalletDisplay({ user }: WalletDisplayProps) {
  const tokens = [
    { symbol: 'USD', balance: user.usd_balance, color: '#00d4ff' },
    { symbol: 'AAPL', balance: user.aapl_balance, color: '#ffd700' },
    { symbol: 'TSLA', balance: user.tsla_balance, color: '#ff4757' },
    { symbol: 'MSFT', balance: user.msft_balance, color: '#00ff88' },
  ];

  const totalValue = 
    user.usd_balance + 
    user.aapl_balance * 175 + 
    user.tsla_balance * 250 + 
    user.msft_balance * 350;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Wallet</h2>
      
      <div style={styles.totalValue}>
        <span style={styles.label}>Total Value:</span>
        <span style={styles.value}>${totalValue.toFixed(2)}</span>
      </div>

      <div style={styles.grid}>
        {tokens.map((token) => (
          <div key={token.symbol} style={{ ...styles.card, borderColor: token.color }}>
            <div style={styles.symbol}>{token.symbol}</div>
            <div style={{ ...styles.balance, color: token.color }}>
              {token.balance.toFixed(4)}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.address}>
        <span style={styles.label}>Address:</span>
        <code>{user.wallet_address}</code>
      </div>
    </div>
  );
}

const styles: Record<string, any> = {
  container: {
    backgroundColor: '#16213e',
    padding: '1.5rem',
    borderRadius: '12px',
    margin: '1rem 0',
  },
  title: {
    color: 'white',
    marginBottom: '1rem',
  },
  totalValue: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  label: {
    color: '#aaa',
  },
  value: {
    color: '#00d4ff',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  },
  card: {
    backgroundColor: '#1a1a2e',
    padding: '1rem',
    borderRadius: '8px',
    borderLeft: '4px solid',
    textAlign: 'center',
  },
  symbol: {
    color: '#aaa',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
  },
  balance: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  address: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#aaa',
    fontSize: '0.9rem',
  },
};