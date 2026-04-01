import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../../lib/api';

export default function Auth() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (!walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      setError('Invalid Ethereum address format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.register({ wallet_address: walletAddress });
      localStorage.setItem('walletAddress', walletAddress);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to StockLedger</h1>
        <p style={styles.subtitle}>
          Register to get started with 10,000 USD
        </p>

        <div style={styles.field}>
          <label style={styles.label}>Wallet Address</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            style={styles.input}
          />
          <p style={styles.hint}>
            Enter your Ethereum wallet address
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>

        <p style={styles.note}>
          New users receive 10,000 USD to start trading
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f1e',
    padding: '2rem',
  },
  card: {
    backgroundColor: '#16213e',
    padding: '3rem',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    color: '#00d4ff',
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#aaa',
    marginBottom: '2rem',
  },
  field: {
    textAlign: 'left',
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    color: 'white',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
    fontFamily: 'monospace',
  },
  hint: {
    color: '#666',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
  },
  error: {
    color: '#ff4757',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderRadius: '8px',
  },
  button: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#00d4ff',
    border: 'none',
    borderRadius: '8px',
    color: '#1a1a2e',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  note: {
    color: '#666',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
  },
};