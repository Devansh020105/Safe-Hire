import React, { useState, useEffect } from 'react';

function App() {
  const [company, setCompany] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for futuristic effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  // Authentication functions
  const handleAuth = async (e, isLogin) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin 
        ? { email, password }
        : { name, email, password };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        setUser(data.data.user);
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError(data.error);
      }
    } catch (error) {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setResult(null);
    setCompany('');
  };

  const checkCredibility = async () => {
    if (!company.trim()) {
      setAuthError('Please enter a company name');
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companyName: company })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setAuthError('');
      } else {
        setAuthError(data.error);
      }
    } catch (error) {
      setAuthError("Unable to connect to backend. Please ensure the server is running!");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return '#00ff88';
    if (score >= 6) return '#00d4ff';
    if (score >= 4) return '#ff6b6b';
    return '#ff4757';
  };

  const getScoreBackground = (score) => {
    if (score >= 8) return 'linear-gradient(135deg, #00ff88, #00cc66)';
    if (score >= 6) return 'linear-gradient(135deg, #00d4ff, #0099cc)';
    if (score >= 4) return 'linear-gradient(135deg, #ff6b6b, #ff5252)';
    return 'linear-gradient(135deg, #ff4757, #ff3838)';
  };

  const getScoreMessage = (score) => {
    if (score >= 8) return '⚡ EXCELLENT TRUST SCORE';
    if (score >= 6) return '🚀 GOOD TRUST SCORE';
    if (score >= 4) return '⚠️ MODERATE TRUST SCORE';
    return '🛑 LOW TRUST SCORE';
  };

  const getRiskColor = (flag) => {
    const highRiskFlags = ['Low Trust Score', 'Poor Reviews', 'Toxic Culture', 'Unstable'];
    const mediumRiskFlags = ['Moderate Risk', 'Mixed Reviews', 'High Pressure', 'Long Hours'];
    
    if (highRiskFlags.some(risk => flag.includes(risk))) return '#ff4757';
    if (mediumRiskFlags.some(risk => flag.includes(risk))) return '#ffa502';
    return '#747d8c';
  };

  // Authentication forms
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, #1a1a2e 0%, #0f0f1e 50%, #050510 100%)`,
        fontFamily: 'Orbitron, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background particles */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 4 + 'px',
                height: Math.random() * 4 + 'px',
                background: '#00ff88',
                borderRadius: '50%',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                opacity: Math.random() * 0.5 + 0.2,
                animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '50px',
          boxShadow: '0 25px 50px rgba(0, 255, 136, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          width: '100%',
          maxWidth: '450px',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Futuristic logo */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #00ff88, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '10px',
              textShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
              animation: 'glow 2s ease-in-out infinite alternate'
            }}>
              SafeHire AI
            </div>
            <div style={{
              color: '#00d4ff',
              fontSize: '0.9rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              opacity: 0.8
            }}>
              {showLogin ? '🔐 QUANTUM AUTHENTICATION' : '🚀 NEURAL REGISTRATION'}
            </div>
          </div>

          {authError && (
            <div style={{
              background: 'rgba(255, 71, 87, 0.1)',
              border: '1px solid rgba(255, 71, 87, 0.3)',
              borderRadius: '15px',
              padding: '15px',
              marginBottom: '25px',
              color: '#ff4757',
              fontSize: '0.9rem',
              animation: 'pulse 1s ease-in-out infinite'
            }}>
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={(e) => handleAuth(e, showLogin)}>
            {!showLogin && (
              <div style={{ marginBottom: '25px' }}>
                <input
                  name="name"
                  type="text"
                  placeholder="👤 NEURAL IDENTITY"
                  required
                  style={{
                    width: '100%',
                    padding: '15px 20px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '2px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '15px',
                    fontSize: '1rem',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#00ff88';
                    e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: '25px' }}>
              <input
                name="email"
                type="email"
                placeholder="📧 QUANTUM EMAIL"
                required
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '15px',
                  fontSize: '1rem',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00ff88';
                  e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <input
                name="password"
                type="password"
                placeholder="🔑 ENCRYPTION KEY (MIN 6 CHARS)"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '15px 20px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: '15px',
                  fontSize: '1rem',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#00ff88';
                  e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '18px',
                background: authLoading 
                  ? 'rgba(116, 125, 140, 0.3)' 
                  : 'linear-gradient(45deg, #00ff88, #00d4ff)',
                color: '#0f0f1e',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: '25px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                boxShadow: authLoading ? 'none' : '0 10px 30px rgba(0, 255, 136, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => {
                if (!authLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 15px 40px rgba(0, 255, 136, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!authLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 10px 30px rgba(0, 255, 136, 0.3)';
                }
              }}
            >
              {authLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid #0f0f1e',
                    borderTop: '3px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '10px'
                  }} />
                  PROCESSING...
                </span>
              ) : (
                <span>{showLogin ? '🔐 INITIATE LOGIN' : '🚀 CREATE IDENTITY'}</span>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                setShowLogin(!showLogin);
                setAuthError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#00d4ff',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                letterSpacing: '1px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.color = '#00ff88';
                e.target.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.color = '#00d4ff';
                e.target.style.textShadow = 'none';
              }}
            >
              {showLogin ? "🔬 NEW TO MATRIX? REGISTER" : "🧬 EXISTING IDENTITY? LOGIN"}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(10px) translateX(-10px); }
            75% { transform: translateY(-10px) translateX(20px); }
          }
          @keyframes glow {
            from { text-shadow: 0 0 30px rgba(0, 255, 136, 0.5); }
            to { text-shadow: 0 0 50px rgba(0, 255, 136, 0.8), 0 0 70px rgba(0, 212, 255, 0.5); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Main application
  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, #1a1a2e 0%, #0f0f1e 50%, #050510 100%)`,
      fontFamily: 'Orbitron, "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background particles */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        pointerEvents: 'none'
      }}>
        {[...Array(75)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 6 + 'px',
              height: Math.random() * 6 + 'px',
              background: `hsl(${Math.random() * 60 + 160}, 100%, 50%)`,
              borderRadius: '50%',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.6 + 0.2,
              animation: `float ${Math.random() * 15 + 10}s infinite ease-in-out`,
              animationDelay: Math.random() * 5 + 's'
            }}
          />
        ))}
      </div>

      {/* Header with user info and logout */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        position: 'relative',
        zIndex: 1
      }}>
        <div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #00ff88, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '5px',
            textShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
            animation: 'glow 2s ease-in-out infinite alternate'
          }}>
            SafeHire AI
          </h1>
          <p style={{
            fontSize: '1rem',
            color: '#00d4ff',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            opacity: 0.8
          }}>
            🛡️ QUANTUM EMPLOYER CREDIBILITY SYSTEM
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ color: '#ffffff', textAlign: 'right' }}>
            <div style={{ fontSize: '0.9rem', color: '#00d4ff', letterSpacing: '1px' }}>WELCOME,</div>
            <div style={{ fontWeight: '600', fontSize: '1.1rem', color: '#00ff88' }}>{user?.name}</div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '12px 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#ff4757',
              border: '2px solid rgba(255, 71, 87, 0.3)',
              borderRadius: '15px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 71, 87, 0.1)';
              e.target.style.borderColor = '#ff4757';
              e.target.style.boxShadow = '0 0 20px rgba(255, 71, 87, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 71, 87, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚪 LOGOUT
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: 'rgba(255, 255, 255, 0.05)',
        WebkitBackdropFilter: 'blur(20px)',
        backdropFilter: 'blur(20px)',
        borderRadius: '30px',
        padding: '50px',
        boxShadow: '0 25px 50px rgba(0, 255, 136, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 1
      }}>
        {authError && (
          <div style={{
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.3)',
            borderRadius: '15px',
            padding: '15px',
            marginBottom: '25px',
            color: '#ff4757',
            fontSize: '0.9rem',
            animation: 'pulse 1s ease-in-out infinite'
          }}>
            ⚠️ {authError}
          </div>
        )}

        <div style={{ marginBottom: '35px' }}>
          <input 
            type="text" 
            value={company} 
            onChange={(e) => setCompany(e.target.value)} 
            placeholder="🔍 ENTER COMPANY MATRIX FOR ANALYSIS..."
            onKeyPress={(e) => e.key === 'Enter' && checkCredibility()}
            style={{
              padding: '20px 25px',
              width: '100%',
              fontSize: '1.2rem',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(0, 255, 136, 0.3)',
              borderRadius: '20px',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxSizing: 'border-box',
              color: '#ffffff',
              letterSpacing: '1px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#00ff88';
              e.target.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 255, 136, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        <button 
          onClick={checkCredibility}
          disabled={loading}
          style={{
            padding: '20px 50px',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            background: loading 
              ? 'rgba(116, 125, 140, 0.3)' 
              : 'linear-gradient(45deg, #00ff88, #00d4ff)',
            color: '#0f0f1e',
            border: 'none',
            borderRadius: '20px',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            width: '100%',
            boxShadow: loading ? 'none' : '0 15px 40px rgba(0, 255, 136, 0.3)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 20px 50px rgba(0, 255, 136, 0.4)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 15px 40px rgba(0, 255, 136, 0.3)';
            }
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '25px',
                height: '25px',
                border: '3px solid #0f0f1e',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '15px'
              }} />
              ANALYZING MATRIX...
            </span>
          ) : (
            <span>🚀 INITIATE ANALYSIS</span>
          )}
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div style={{
          maxWidth: '700px',
          margin: '50px auto',
          background: 'rgba(255, 255, 255, 0.05)',
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
          borderRadius: '30px',
          padding: '50px',
          boxShadow: '0 25px 50px rgba(0, 255, 136, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          zIndex: 1,
          animation: 'slideUp 0.8s ease-out'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{
              fontSize: '2.2rem',
              background: 'linear-gradient(45deg, #00ff88, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '15px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textTransform: 'uppercase'
            }}>
              📊 QUANTUM ANALYSIS COMPLETE
            </h2>
            <p style={{
              fontSize: '1.5rem',
              color: '#00d4ff',
              fontWeight: '500',
              letterSpacing: '1px'
            }}>
              {result.companyName}
            </p>
          </div>

          <div style={{
            textAlign: 'center',
            marginBottom: '40px',
            padding: '40px',
            borderRadius: '25px',
            background: getScoreBackground(result.trustScore),
            color: '#0f0f1e',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
              animation: 'shimmer 3s infinite'
            }} />
            <div style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              marginBottom: '15px',
              lineHeight: '1',
              position: 'relative',
              zIndex: 1
            }}>
              {result.trustScore}/10
            </div>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '600',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              position: 'relative',
              zIndex: 1
            }}>
              {getScoreMessage(result.trustScore)}
            </div>
            {result.scoreFactors && (
              <div style={{
                marginTop: '15px',
                fontSize: '0.9rem',
                opacity: 0.8,
                position: 'relative',
                zIndex: 1
              }}>
                {result.scoreFactors.join(' • ')}
              </div>
            )}
          </div>

          {/* Comprehensive Review Section */}
          {result.review && (
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{
                fontSize: '1.5rem',
                color: '#00d4ff',
                marginBottom: '25px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textAlign: 'center'
              }}>
                📋 COMPREHENSIVE REVIEW
              </h3>
              
              {/* Summary */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                WebkitBackdropFilter: 'blur(10px)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '25px',
                marginBottom: '25px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h4 style={{
                  color: '#00ff88',
                  fontSize: '1.1rem',
                  marginBottom: '15px',
                  fontWeight: '600',
                  letterSpacing: '1px'
                }}>
                  📝 SUMMARY
                </h4>
                <p style={{
                  color: '#ffffff',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  opacity: 0.9
                }}>
                  {result.review.summary}
                </p>
              </div>

              {/* Strengths */}
              {result.review.strengths && result.review.strengths.length > 0 && (
                <div style={{
                  background: 'rgba(0, 255, 136, 0.1)',
                  WebkitBackdropFilter: 'blur(10px)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '25px',
                  marginBottom: '25px',
                  border: '1px solid rgba(0, 255, 136, 0.3)'
                }}>
                  <h4 style={{
                    color: '#00ff88',
                    fontSize: '1.1rem',
                    marginBottom: '15px',
                    fontWeight: '600',
                    letterSpacing: '1px'
                  }}>
                    💪 STRENGTHS
                  </h4>
                  <ul style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    paddingLeft: '20px',
                    margin: 0
                  }}>
                    {result.review.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {result.review.weaknesses && result.review.weaknesses.length > 0 && (
                <div style={{
                  background: 'rgba(255, 71, 87, 0.1)',
                  WebkitBackdropFilter: 'blur(10px)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '25px',
                  marginBottom: '25px',
                  border: '1px solid rgba(255, 71, 87, 0.3)'
                }}>
                  <h4 style={{
                    color: '#ff4757',
                    fontSize: '1.1rem',
                    marginBottom: '15px',
                    fontWeight: '600',
                    letterSpacing: '1px'
                  }}>
                    ⚠️ WEAKNESSES
                  </h4>
                  <ul style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    paddingLeft: '20px',
                    margin: 0
                  }}>
                    {result.review.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Salary Info */}
              {result.review.salaryInfo && (
                <div style={{
                  background: 'rgba(0, 212, 255, 0.1)',
                  WebkitBackdropFilter: 'blur(10px)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '25px',
                  marginBottom: '25px',
                  border: '1px solid rgba(0, 212, 255, 0.3)'
                }}>
                  <h4 style={{
                    color: '#00d4ff',
                    fontSize: '1.1rem',
                    marginBottom: '15px',
                    fontWeight: '600',
                    letterSpacing: '1px'
                  }}>
                    💰 SALARY INFORMATION
                  </h4>
                  <p style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    margin: 0
                  }}>
                    {result.review.salaryInfo.description}
                  </p>
                </div>
              )}

              {/* Culture Info */}
              {result.review.cultureInfo && (
                <div style={{
                  background: 'rgba(255, 165, 2, 0.1)',
                  WebkitBackdropFilter: 'blur(10px)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '25px',
                  marginBottom: '25px',
                  border: '1px solid rgba(255, 165, 2, 0.3)'
                }}>
                  <h4 style={{
                    color: '#ffa502',
                    fontSize: '1.1rem',
                    marginBottom: '15px',
                    fontWeight: '600',
                    letterSpacing: '1px'
                  }}>
                    🏢 COMPANY CULTURE
                  </h4>
                  <p style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    margin: '0 0 10px 0'
                  }}>
                    Rating: {result.review.cultureInfo.overallRating}/5.0
                  </p>
                  <p style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    margin: 0
                  }}>
                    {result.review.cultureInfo.description}
                  </p>
                </div>
              )}

              {/* Growth Opportunities */}
              {result.review.growthOpportunities && (
                <div style={{
                  background: 'rgba(156, 39, 176, 0.1)',
                  WebkitBackdropFilter: 'blur(10px)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '25px',
                  marginBottom: '25px',
                  border: '1px solid rgba(156, 39, 176, 0.3)'
                }}>
                  <h4 style={{
                    color: '#9c27b0',
                    fontSize: '1.1rem',
                    marginBottom: '15px',
                    fontWeight: '600',
                    letterSpacing: '1px'
                  }}>
                    📈 GROWTH OPPORTUNITIES
                  </h4>
                  <p style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    margin: '0 0 10px 0'
                  }}>
                    Status: {result.review.growthOpportunities.status}
                  </p>
                  <p style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    margin: 0
                  }}>
                    {result.review.growthOpportunities.description}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {result.review.recommendations && result.review.recommendations.length > 0 && (
                <div style={{
                  background: 'rgba(0, 255, 136, 0.1)',
                  WebkitBackdropFilter: 'blur(10px)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '25px',
                  border: '1px solid rgba(0, 255, 136, 0.3)'
                }}>
                  <h4 style={{
                    color: '#00ff88',
                    fontSize: '1.1rem',
                    marginBottom: '15px',
                    fontWeight: '600',
                    letterSpacing: '1px'
                  }}>
                    🎯 RECOMMENDATIONS
                  </h4>
                  <ul style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    opacity: 0.9,
                    paddingLeft: '20px',
                    margin: 0
                  }}>
                    {result.review.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Risk Indicators */}
          <div>
            <h3 style={{
              fontSize: '1.5rem',
              color: '#00d4ff',
              marginBottom: '25px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}>
              ⚠️ RISK INDICATORS
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '15px',
              justifyContent: 'center'
            }}>
              {result.riskFlags.map((flag, index) => (
                <span
                  key={index}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    background: getRiskColor(flag),
                    color: '#ffffff',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-3px) scale(1.05)';
                    e.target.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
                  }}
                >
                  {flag}
                </span>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          {result.rawData && (
            <div style={{
              marginTop: '35px',
              paddingTop: '25px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center'
            }}>
              <h4 style={{
                color: '#00d4ff',
                fontSize: '1.1rem',
                marginBottom: '15px',
                fontWeight: '600',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                📡 DATA SOURCES
              </h4>
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                flexWrap: 'wrap'
              }}>
                {result.rawData.glassdoor && (
                  <span style={{
                    padding: '8px 16px',
                    background: 'rgba(0, 255, 136, 0.2)',
                    borderRadius: '15px',
                    color: '#00ff88',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Glassdoor
                  </span>
                )}
                {result.rawData.indeed && (
                  <span style={{
                    padding: '8px 16px',
                    background: 'rgba(0, 212, 255, 0.2)',
                    borderRadius: '15px',
                    color: '#00d4ff',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    Indeed
                  </span>
                )}
                {result.rawData.linkedin && (
                  <span style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 165, 2, 0.2)',
                    borderRadius: '15px',
                    color: '#ffa502',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    LinkedIn
                  </span>
                )}
              </div>
            </div>
          )}

          <div style={{
            textAlign: 'center',
            marginTop: '25px',
            color: '#747d8c',
            fontSize: '0.9rem',
            letterSpacing: '1px'
          }}>
            🕒 MATRIX UPDATED: {new Date(result.lastUpdated).toLocaleString()}
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(10px) translateX(-10px); }
          75% { transform: translateY(-10px) translateX(20px); }
        }
        @keyframes glow {
          from { text-shadow: 0 0 30px rgba(0, 255, 136, 0.5); }
          to { text-shadow: 0 0 50px rgba(0, 255, 136, 0.8), 0 0 70px rgba(0, 212, 255, 0.5); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(50px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export default App;