import { useState } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('rol', res.data.rol)
      if (res.data.rol === 'admin') window.location.href = '/admin'
      else window.location.href = '/dashboard'
    } catch {
      setError('Correo o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#063D24,#0A5C36)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Segoe UI,sans-serif'}}>
      <div style={{background:'#fff',borderRadius:16,padding:'40px 36px',width:'100%',maxWidth:400,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:40,marginBottom:8}}>🌱</div>
          <h1 style={{margin:0,fontSize:22,fontWeight:800,color:'#0A5C36'}}>ComunApp</h1>
          <p style={{margin:'6px 0 0',fontSize:13,color:'#5A7060'}}>Diagnóstico de Madurez Organizacional</p>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'#5A7060',marginBottom:5}}>CORREO</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@organización.com"
              required
              style={{width:'100%',boxSizing:'border-box',padding:'10px 14px',border:'1.5px solid #D4E0D4',borderRadius:8,fontSize:14,outline:'none',fontFamily:'inherit'}}
            />
          </div>
          <div style={{marginBottom:24}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'#5A7060',marginBottom:5}}>CONTRASEÑA</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{width:'100%',boxSizing:'border-box',padding:'10px 14px',border:'1.5px solid #D4E0D4',borderRadius:8,fontSize:14,outline:'none',fontFamily:'inherit'}}
            />
          </div>
          {error && <p style={{color:'#C0392B',fontSize:13,marginBottom:16,textAlign:'center'}}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{width:'100%',padding:'12px',background:loading?'#ccc':'linear-gradient(135deg,#0A5C36,#148A50)',border:'none',borderRadius:8,color:'#fff',fontSize:15,fontWeight:700,cursor:loading?'not-allowed':'pointer',fontFamily:'inherit'}}
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
