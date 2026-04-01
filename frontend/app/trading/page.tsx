'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import SwapForm from '../../components/SwapForm';
import { api, User } from '../../lib/api';

export default function Trading() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapSuccess = () => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (walletAddress) {
      loadUserData(walletAddress);
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
        currentPage="trading"
        walletAddress={user?.wallet_address || null}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main style={styles.main}>
        <h1 style={styles.title}>Trading</h1>

        <div style={styles.grid}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Your Balances</h2>
            <div style={styles.balances}>
              <div style={styles.balanceItem}>
                <span style={styles.token}>USD</span>
                <span style={styles.amount}>{user?.usd_balance.toFixed(4) || 0}</span>
              </div>
              <div style={styles.balanceItem}>
                <span style={styles.token}>AAPL</span>
                <span style={styles.amount}>{user?.aapl_balance.toFixed(4) || 0}</span>
              </div>
              <div style={styles.balanceItem}>
                <span style={styles.token}>TSLA</span>
                <span style={styles.amount}>{user?.tsla_balance.toFixed(4) || 0}</span>
              </div>
              <div style={styles.balanceItem}>
                <span style={styles.token}>MSFT</span>
                <span style={styles.amount}>{user?.msft_balance.toFixed(4) || 0}</span>
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <SwapForm
              walletAddress={user?.wallet_address || ''}
              onSwapSuccess={handleSwapSuccess}
            />
          </div>
        </div>

        <div style={styles.info}>
          <h3>How it works</h3>
          <ul>
            <li>Swap USD for stocks (AAPL, TSLA, MSFT)</li>
            <li>Swap stocks back to USD</li>
            <li>1% fee on each swap</li>
            <li>Prices are administratively set (synthetic)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, any> = {
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
    maxWidth: '1000px',
    margin: '0 auto',
  },
  title: {
    color: '#00d4ff',
    fontSize: '2.5rem',
    marginBottom: '2rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  section: {
    backgroundColor: '#16213e',
    padding: '1.5rem',
    borderRadius: '12px',
  },
  sectionTitle: {
    color: 'white',
    marginBottom: '1rem',
  },
  balances: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  balanceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
  },
  token: {
    color: '#00d4ff',
    fontWeight: 'bold',
  },
  amount: {
    color: 'white',
  },
  info: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#16213e',
    borderRadius: '12px',
    color: '#aaa',
  },
};