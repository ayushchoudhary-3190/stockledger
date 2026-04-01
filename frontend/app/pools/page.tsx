import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import PoolCard from '../../components/PoolCard';
import { api, Pool } from '../../lib/api';

export default function Pools() {
  const router = useRouter();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      router.push('/auth');
      return;
    }

    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      const data = await api.getPools();
      setPools(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      await api.initializePools();
      loadPools();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('walletAddress');
    router.push('/');
  };

  const handleNavigate = (page: string) => {
    router.push(`/${page}`);
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <Navbar
        currentPage="pools"
        walletAddress={null}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main style={styles.main}>
        <div style={styles.header}>
          <h1 style={styles.title}>Liquidity Pools</h1>
          
          {pools.length === 0 && (
            <button onClick={handleInitialize} style={styles.initBtn}>
              Initialize Pools
            </button>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {pools.length === 0 ? (
          <div style={styles.empty}>
            <p>No pools initialized yet.</p>
            <p>Click "Initialize Pools" to create AAPL, TSLA, and MSFT pools.</p>
          </div>
        ) : (
          <div style={styles.poolList}>
            {pools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        )}

        <div style={styles.info}>
          <h3>About Pools</h3>
          <p>
            Each pool represents a stock token trading pair with USD.
            The price is administratively set and stable.
          </p>
          <ul>
            <li><strong>AAPL</strong> - Apple Inc. @ $175</li>
            <li><strong>TSLA</strong> - Tesla Inc. @ $250</li>
            <li><strong>MSFT</strong> - Microsoft Corp. @ $350</li>
          </ul>
          <p>All pools have a 1% swap fee.</p>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0f1e',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: 'white',
  },
  main: {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    color: '#00d4ff',
    fontSize: '2.5rem',
  },
  initBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#00d4ff',
    border: 'none',
    borderRadius: '8px',
    color: '#1a1a2e',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: '#ff4757',
    padding: '1rem',
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderRadius: '8px',
    marginBottom: '1rem',
  },
  empty: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#16213e',
    borderRadius: '12px',
    color: '#aaa',
  },
  poolList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  info: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#16213e',
    borderRadius: '12px',
    color: '#aaa',
  },
};