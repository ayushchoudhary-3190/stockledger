import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import WalletDisplay from '../../components/Wallet';
import { api, User } from '../../lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      router.push('/auth');
      return;
    }

    loadUserData(walletAddress);
  }, []);

  const loadUserData = async (address: string) => {
    try {
      const userData = await api.getBalance(address);
      setUser(userData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
        <button onClick={() => router.push('/auth')} style={styles.button}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Navbar
        currentPage="dashboard"
        walletAddress={user?.wallet_address || null}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main style={styles.main}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.welcome}>Welcome back!</p>

        {user && <WalletDisplay user={user} />}

        <div style={styles.quickActions}>
          <button
            onClick={() => router.push('/trading')}
            style={styles.actionBtn}
          >
            Start Trading →
          </button>
          <button
            onClick={() => router.push('/pools')}
            style={styles.actionBtn}
          >
            View Pools →
          </button>
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
  title: {
    color: '#00d4ff',
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  welcome: {
    color: '#aaa',
    marginBottom: '2rem',
  },
  error: {
    color: '#ff4757',
    textAlign: 'center',
    padding: '2rem',
  },
  button: {
    display: 'block',
    margin: '1rem auto',
    padding: '1rem 2rem',
    backgroundColor: '#00d4ff',
    border: 'none',
    borderRadius: '8px',
    color: '#1a1a2e',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  quickActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginTop: '2rem',
  },
  actionBtn: {
    padding: '1.5rem',
    backgroundColor: '#16213e',
    border: '1px solid #333',
    borderRadius: '12px',
    color: 'white',
    fontSize: '1.1rem',
    cursor: 'pointer',
    textAlign: 'center',
  },
};