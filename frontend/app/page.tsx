import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { api } from '../../lib/api';

export default function Home() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('walletAddress');
    if (saved) {
      setWalletAddress(saved);
    }
    setLoading(false);
  }, []);

  const handleLogin = (address: string) => {
    setWalletAddress(address);
    localStorage.setItem('walletAddress', address);
    router.push('/dashboard');
  };

  const handleLogout = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
    router.push('/');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    router.push(`/${page}`);
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <Navbar
        currentPage={currentPage}
        walletAddress={walletAddress}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      
      <main style={styles.main}>
        <div style={styles.hero}>
          <h1 style={styles.title}>StockLedger</h1>
          <p style={styles.subtitle}>
            Decentralized Stock Trading Platform
          </p>
          
          <div style={styles.features}>
            <div style={styles.feature}>
              <h3>🔒</h3>
              <h4>Secure</h4>
              <p>Built on custom blockchain</p>
            </div>
            <div style={styles.feature}>
              <h3>⚡</h3>
              <h4>Fast</h4>
              <p>AMM-based trading</p>
            </div>
            <div style={styles.feature}>
              <h3>💰</h3>
              <h4>Low Fees</h4>
              <p>Only 1% swap fee</p>
            </div>
          </div>

          {!walletAddress && (
            <button onClick={() => router.push('/auth')} style={styles.cta}>
              Get Started
            </button>
          )}
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
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 0',
  },
  title: {
    fontSize: '4rem',
    color: '#00d4ff',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#aaa',
    marginBottom: '3rem',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  feature: {
    backgroundColor: '#16213e',
    padding: '2rem',
    borderRadius: '12px',
    textAlign: 'center',
  },
  cta: {
    marginTop: '3rem',
    padding: '1rem 3rem',
    fontSize: '1.2rem',
    backgroundColor: '#00d4ff',
    border: 'none',
    borderRadius: '8px',
    color: '#1a1a2e',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};