'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AdminStats {
  total_users: number;
  total_transactions: number;
  total_liquidity: number;
  pools: Array<{
    symbol: string;
    usd_reserve: number;
    stock_reserve: number;
    price: number;
    fee_tier: number;
  }>;
}

interface Price {
  symbol: string;
  price: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
  const [selectedPrice, setSelectedPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      loadData();
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const loadData = async () => {
    try {
      const statsRes = await fetch('http://localhost:8080/api/admin/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      const pricesRes = await fetch('http://localhost:8080/api/admin/prices');
      const pricesData = await pricesRes.json();
      setPrices(pricesData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        loadData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedPrice || !newPrice) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/admin/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedPrice, price: parseFloat(newPrice) }),
      });
      if (res.ok) {
        alert('Price updated!');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.loginCard}>
          <h1 style={styles.title}>Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            style={styles.input}
          />
          {error && <div style={styles.error}>{error}</div>}
          <button onClick={handleLogin} disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2>System Stats</h2>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Total Users</span>
              <span style={styles.statValue}>{stats?.total_users || 0}</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Total Transactions</span>
              <span style={styles.statValue}>{stats?.total_transactions || 0}</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Total Liquidity</span>
              <span style={styles.statValue}>${(stats?.total_liquidity || 0).toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section style={styles.section}>
          <h2>Pool Status</h2>
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span>Symbol</span>
              <span>USD Reserve</span>
              <span>Stock Reserve</span>
              <span>Price</span>
              <span>Fee</span>
            </div>
            {stats?.pools.map((pool) => (
              <div key={pool.symbol} style={styles.tableRow}>
                <span style={styles.symbol}>{pool.symbol}</span>
                <span>${pool.usd_reserve.toLocaleString()}</span>
                <span>{pool.stock_reserve.toFixed(2)}</span>
                <span>${pool.price}</span>
                <span>{(pool.fee_tier * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </section>

        <section style={styles.section}>
          <h2>Update Price</h2>
          <div style={styles.priceForm}>
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              style={styles.select}
            >
              <option value="">Select Stock</option>
              {prices.map((p) => (
                <option key={p.symbol} value={p.symbol}>
                  {p.symbol} - ${p.price}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="New Price"
              style={styles.input}
            />
            <button onClick={handleUpdatePrice} disabled={loading} style={styles.button}>
              Update Price
            </button>
          </div>
          <p style={styles.note}>Note: If price changes > 10%, an alert is triggered</p>
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, any> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f0f1e',
    color: 'white',
  },
  loginCard: {
    maxWidth: '400px',
    margin: '100px auto',
    padding: '2rem',
    backgroundColor: '#16213e',
    borderRadius: '12px',
    textAlign: 'center',
  },
  title: {
    color: '#00d4ff',
    marginBottom: '1.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#00d4ff',
    border: 'none',
    borderRadius: '8px',
    color: '#1a1a2e',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: {
    color: '#ff4757',
    marginBottom: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ff4757',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
  },
  main: {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#16213e',
    borderRadius: '12px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  },
  statCard: {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
  },
  statLabel: {
    display: 'block',
    color: '#aaa',
    marginBottom: '0.5rem',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    padding: '1rem',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    fontWeight: 'bold',
    color: '#00d4ff',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    padding: '1rem',
    borderBottom: '1px solid #333',
  },
  symbol: {
    fontWeight: 'bold',
    color: '#ffd700',
  },
  priceForm: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  select: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
  },
  note: {
    color: '#666',
    fontSize: '0.9rem',
  },
};