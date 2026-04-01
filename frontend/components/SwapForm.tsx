'use client';

import { useState } from 'react';
import { api, SwapRequest } from '../lib/api';

interface SwapFormProps {
  walletAddress: string;
  onSwapSuccess: () => void;
}

export default function SwapForm({ walletAddress, onSwapSuccess }: SwapFormProps) {
  const [fromToken, setFromToken] = useState('USD');
  const [toToken, setToToken] = useState('AAPL');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const tokens = ['USD', 'AAPL', 'TSLA', 'MSFT'];

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const request: SwapRequest = {
        wallet_address: walletAddress,
        from_token: fromToken,
        to_token: toToken,
        amount: parseFloat(amount),
      };

      const response = await api.swap(request);
      setResult(response);
      onSwapSuccess();
    } catch (err: any) {
      setError(err.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Swap</h2>

      <div style={styles.field}>
        <label style={styles.label}>From</label>
        <select
          value={fromToken}
          onChange={(e) => {
            setFromToken(e.target.value);
            setToToken(e.target.value === 'USD' ? 'AAPL' : 'USD');
          }}
          style={styles.select}
        >
          {tokens.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>To</label>
        <select
          value={toToken}
          onChange={(e) => setToToken(e.target.value)}
          style={styles.select}
        >
          {tokens.filter(t => t !== fromToken).map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          style={styles.input}
        />
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {result && (
        <div style={styles.result}>
          <p>Received: <strong>{result.outputAmount.toFixed(4)} {toToken}</strong></p>
          <p>Fee: <strong>{result.fee.toFixed(4)} {fromToken}</strong></p>
        </div>
      )}

      <button
        onClick={handleSwap}
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? 'Swapping...' : `Swap ${fromToken} to ${toToken}`}
      </button>
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
    marginBottom: '1.5rem',
  },
  field: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    color: '#aaa',
    marginBottom: '0.5rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1a1a2e',
    border: '1px solid #333',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1rem',
  },
  error: {
    color: '#ff4757',
    marginBottom: '1rem',
  },
  result: {
    backgroundColor: '#1a1a2e',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    color: '#00d4ff',
  },
  button: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#00d4ff',
    border: 'none',
    borderRadius: '8px',
    color: '#1a1a2e',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};