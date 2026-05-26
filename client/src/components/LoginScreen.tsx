type Props = {
    logo: string
    loginName: string
    loginPass: string
    loginError: string | null
    loginLoading: boolean
    setLoginName: (v: string) => void
    setLoginPass: (v: string) => void
    doLogin: () => void
  }
  
  export default function LoginScreen({
    logo,
    loginName,
    loginPass,
    loginError,
    loginLoading,
    setLoginName,
    setLoginPass,
    doLogin,
  }: Props) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <div
          style={{
            width: 'min(460px, 100%)',
            borderRadius: 16,
            padding: 22,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
            <img src={logo} alt='Yanfeng' style={{ height: 44, objectFit: 'contain' }} />
  
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: 0.2 }}>ODS/TDS</div>
              <div style={{ opacity: 0.75, marginTop: 2 }}>Document Center</div>
            </div>
  
            <div style={{ width: '100%', display: 'grid', gap: 10, marginTop: 6 }}>
              <input
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                type='text'
                placeholder='Meno'
                aria-label='Meno'
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(0,0,0,0.18)',
                  color: 'white',
                  outline: 'none',
                  fontSize: 14,
                }}
              />
  
              <input
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                type='password'
                placeholder='Heslo'
                aria-label='Heslo'
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(0,0,0,0.18)',
                  color: 'white',
                  outline: 'none',
                  fontSize: 14,
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') doLogin()
                }}
              />
  
              <button
                onClick={doLogin}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#7c5cff',
                  color: 'white',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
                disabled={loginLoading}
              >
                {loginLoading ? 'Prihlasujem…' : 'Prihlásiť'}
              </button>
  
              {loginError && (
                <div style={{ width: '100%', color: '#ff8a8a', fontSize: 13, textAlign: 'center' }}>
                  {loginError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }