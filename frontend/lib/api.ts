const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface User {
  id: number;
  wallet_address: string;
  usd_balance: number;
  aapl_balance: number;
  tsla_balance: number;
  msft_balance: number;
  created_at: string;
  updated_at: string;
}

export interface Pool {
  id: number;
  symbol: string;
  token_address: string;
  usd_reserve: number;
  stock_reserve: number;
  price: number;
  fee_tier: number;
  total_liquidity: number;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: string;
  token: string;
  amount: number;
  price: number;
  fee: number;
  pool_id: number | null;
  tx_hash: string | null;
  created_at: string;
}

export interface SwapRequest {
  wallet_address: string;
  from_token: string;
  to_token: string;
  amount: number;
}

export interface SwapResponse {
  output_amount: number;
  fee: number;
  new_price: number;
}

export interface RegisterRequest {
  wallet_address: string;
}

const fetchAPI = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

export const api = {
  register: (data: RegisterRequest) =>
    fetchAPI<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBalance: (walletAddress: string) =>
    fetchAPI<User>(`/api/wallet/${walletAddress}`),

  getTransactions: (walletAddress: string) =>
    fetchAPI<Transaction[]>(`/api/wallet/${walletAddress}/transactions`),

  swap: (data: SwapRequest) =>
    fetchAPI<SwapResponse>('/api/swap', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPools: () => fetchAPI<Pool[]>('/api/pools'),

  getPool: (symbol: string) => fetchAPI<Pool>(`/api/pools/${symbol}`),

  initializePools: () =>
    fetchAPI<{ message: string }>('/api/admin/initialize-pools', {
      method: 'POST',
    }),

  getHealth: () => fetchAPI<{ status: string }>('/health'),
};