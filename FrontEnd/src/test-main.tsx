import React from 'react';
import ReactDOM from 'react-dom/client';

function TestApp() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🔍 React Test App</h1>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>✅ React is Working!</h2>
        <p>If you can see this, React is loading correctly.</p>
        <p>Current time: {new Date().toLocaleString()}</p>
        <button 
          onClick={() => alert('Button clicked!')}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Click
        </button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
