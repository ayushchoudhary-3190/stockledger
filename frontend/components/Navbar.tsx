export interface NavbarProps {
  currentPage: string;
  walletAddress: string | null;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Navbar({ currentPage, walletAddress, onNavigate, onLogout }: NavbarProps) {
  const pages = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'trading', label: 'Trading' },
    { id: 'pools', label: 'Pools' },
  ];

  return (
    <nav style={styles.navbar}>
      <div style={styles.logo}>
        <h1>StockLedger</h1>
      </div>
      
      <div style={styles.links}>
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onNavigate(page.id)}
            style={{
              ...styles.link,
              ...(currentPage === page.id ? styles.activeLink : {}),
            }}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div style={styles.wallet}>
        {walletAddress ? (
          <div style={styles.walletInfo}>
            <span style={styles.address}>
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
            <button onClick={onLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        ) : (
          <button onClick={() => onNavigate('auth')} style={styles.loginBtn}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1a2e',
    color: 'white',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1rem',
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.5rem 1rem',
  },
  activeLink: {
    color: '#00d4ff',
    borderBottom: '2px solid #00d4ff',
  },
  wallet: {
    display: 'flex',
    alignItems: 'center',
  },
  walletInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  address: {
    fontFamily: 'monospace',
    backgroundColor: '#16213e',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
  },
  loginBtn: {
    backgroundColor: '#00d4ff',
    border: 'none',
    color: '#1a1a2e',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#ff4757',
    border: 'none',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};