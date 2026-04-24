import { useEffect, useState } from 'react'
import axios from 'axios'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

const API = import.meta.env.VITE_API_URL

const DIMS = [
  { key:'D1', label:'Gobernanza', color:'#0A5C36', vars:['v1_1','v1_2','v1_3','v1_4','v1_5','v1_6'] },
  { key:'D2', label:'Estrategia', color:'#1A7A50', vars:['v2_1','v2_2','v2_3','v2_4','v2_5'] },
  { key:'D3', label:'Proyectos', color:'#2E8B57', vars:['v3_1','v3_2','v3_3'] },
  { key:'D4', label:'Finanzas', color:'#B8860B', vars:['v4_1','v4_2','v4_3','v4_4','v4_5'] },
  { key:'D5', label:'Talento', color:'#8B4513', vars:['v5_1','v5_2','v5_3','v5_4','v5_5'] },
  { key:'D6', label:'Comunicación', color:'#1A4D8A', vars:['v6_1','v6_2','v6_3','v6_4'] },
  { key:'D7', label:'Impacto', color:'#6A1B9A', vars:['v7_1','v7_2','v7_3'] },
]

const levelColor = v => v>=3.5?'#0A5C36':v>=2.5?'#2E8B57':v>=1.5?'#E8A020':'#C0392B'
const levelLabel = v => v>=3.5?'Optimizado':v>=2.5?'Establecido':v>=1.5?'Básico':'Inicial'
const dimAvg = (d, row) => { const vals = d.vars.map(v=>parseFloat(row[v]||0)); return vals.reduce((a,b)=>a+b,0)/vals.length }

export default function Admin() {
  const [orgs, setOrgs] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [tab, setTab] = useState('tabla')
  const [filterMpal, setFilterMpal] = useState('Todos')
  const [selected, setSelected] = useState(null)
  const [editUser, setEditUser] = useState(null)
  const [newPass, setNewPass] = useState('')
  const [msg, setMsg] = useState('')

  const token = localStorage.getItem('token')
  const headers = { Authorization:`Bearer ${token}` }

  useEffect(() => {
    axios.get(`${API}/api/admin/organizaciones`, { headers }).then(r => setOrgs(r.data)).catch(() => window.location.href='/')
    axios.get(`${API}/api/admin/usuarios`, { headers }).then(r => setUsuarios(r.data))
  }, [])

  const municipios = ['Todos', ...new Set(orgs.map(o=>o.municipio))]
  const filtered = orgs.filter(o => filterMpal==='Todos' || o.municipio===filterMpal)

  const radarData = selected
    ? DIMS.map(d => ({ dim:d.key, puntaje:+dimAvg(d,selected).toFixed(2) }))
    : DIMS.map(d => {
        const vals = filtered.map(o => dimAvg(d,o))
        return { dim:d.key, puntaje:+(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2) }
      })

  const handleToggle = async (u) => {
    await axios.put(`${API}/api/admin/usuarios/${u.id}`, { activo:!u.activo }, { headers })
    setUsuarios(prev => prev.map(x => x.id===u.id ? {...x, activo:!u.activo} : x))
  }

  const handlePass = async (u) => {
    if (!newPass) return
    await axios.put(`${API}/api/admin/usuarios/${u.id}`, { password:newPass }, { headers })
    setMsg('Contraseña actualizada')
    setEditUser(null)
    setNewPass('')
    setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div style={{minHeight:'100vh',background:'#F3F6F3',fontFamily:'Segoe UI,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#063D24,#0A5C36)',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontSize:28}}>🌱</div>
          <div>
            <div style={{color:'#fff',fontWeight:800,fontSize:16}}>ComunApp · Admin</div>
            <div style={{color:'rgba(255,255,255,0.7)',fontSize:12}}>{orgs.length} organizaciones</div>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href='/' }} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',padding:'7px 14px',borderRadius:7,cursor:'pointer',fontSize:13}}>Cerrar sesión</button>
      </div>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'20px 16px 60px'}}>
        {msg && <div style={{background:'#d4edda',border:'1px solid #28a745',borderRadius:8,padding:'10px 16px',marginBottom:16,color:'#155724',fontSize:13}}>{msg}</div>}

        <div style={{display:'flex',gap:8,marginBottom:20}}>
          {['tabla','radar','usuarios'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{padding:'8px 18px',borderRadius:8,border:'none',background:tab===t?'#0A5C36':'#fff',color:tab===t?'#fff':'#5A7060',fontWeight:700,fontSize:13,cursor:'pointer',border:'1px solid #D4E0D4'}}>
              {t==='tabla'?'Tabla':t==='radar'?'Araña':'Usuarios'}
            </button>
          ))}
          <select value={filterMpal} onChange={e=>{setFilterMpal(e.target.value);setSelected(null)}} style={{marginLeft:'auto',padding:'8px 12px',borderRadius:8,border:'1px solid #D4E0D4',fontSize:13,background:'#fff',color:'#1C2B1C'}}>
            {municipios.map(m=><option key={m}>{m}</option>)}
          </select>
        </div>

        {tab==='tabla' && (
          <div style={{background:'#fff',borderRadius:12,overflow:'hidden',border:'1px solid #D4E0D4'}}>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                <thead>
                  <tr style={{background:'#F0F5F0'}}>
                    <th style={{padding:'10px 14px',textAlign:'left',color:'#5A7060',fontWeight:700,borderBottom:'1px solid #D4E0D4',minWidth:200}}>Organización</th>
                    <th style={{padding:'10px 8px',color:'#5A7060',borderBottom:'1px solid #D4E0D4',minWidth:80}}>Municipio</th>
                    {DIMS.map(d=><th key={d.key} style={{padding:'10px 6px',color:d.color,fontWeight:700,borderBottom:'1px solid #D4E0D4',minWidth:45,textAlign:'center'}}>{d.key}</th>)}
                    <th style={{padding:'10px 8px',color:'#0A5C36',fontWeight:700,borderBottom:'1px solid #D4E0D4',minWidth:55,textAlign:'center'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o,idx) => {
                    const avgs = DIMS.map(d=>dimAvg(d,o))
                    const total = avgs.reduce((a,b)=>a+b,0)/avgs.length
                    return (
                      <tr key={idx} style={{borderBottom:'1px solid #D4E0D4',background:idx%2===0?'#fff':'#FAFCFA',cursor:'pointer'}} onClick={()=>{setSelected(o);setTab('radar')}}>
                        <td style={{padding:'8px 14px',color:'#1C2B1C',fontWeight:500}}>
                          <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:220}} title={o.nombre}>{o.nombre}</div>
                        </td>
                        <td style={{padding:'8px',color:'#5A7060',fontSize:11}}>{o.municipio}</td>
                        {avgs.map((a,i)=><td key={i} style={{padding:'8px 6px',textAlign:'center',fontWeight:700,color:levelColor(a)}}>{a.toFixed(1)}</td>)}
                        <td style={{padding:'8px',textAlign:'center',fontWeight:800,color:levelColor(total)}}>{total.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='radar' && (
          <div style={{background:'#fff',borderRadius:12,padding:20,border:'1px solid #D4E0D4'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{margin:0,fontSize:14,fontWeight:700,color:'#5A7060'}}>
                {selected ? selected.nombre : `Promedio ${filterMpal} (${filtered.length} orgs)`}
              </h3>
              {selected && <button onClick={()=>setSelected(null)} style={{fontSize:12,color:'#5A7060',background:'#F3F6F3',border:'1px solid #D4E0D4',borderRadius:6,padding:'4px 10px',cursor:'pointer'}}>Ver promedio</button>}
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#D4E0D4" />
                <PolarAngleAxis dataKey="dim" tick={{fontSize:11,fontWeight:700,fill:'#0A5C36'}} />
                <PolarRadiusAxis domain={[0,4]} tickCount={5} tick={{fontSize:9}} />
                <Radar dataKey="puntaje" stroke="#0A5C36" fill="#0A5C36" fillOpacity={0.25} strokeWidth={2.5} />
                <Tooltip contentStyle={{fontSize:12,borderRadius:8}} />
              </RadarChart>
            </ResponsiveContainer>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8,marginTop:12}}>
              {DIMS.map((d,i)=>(
                <div key={d.key} style={{padding:'8px 10px',background:'#F3F6F3',borderRadius:8,borderLeft:`3px solid ${d.color}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:700,color:d.color}}>{d.key} · {d.label}</span>
                    <span style={{fontSize:12,fontWeight:800,color:levelColor(radarData[i].puntaje)}}>{radarData[i].puntaje}</span>
                  </div>
                  <div style={{height:4,background:'#E8EDE8',borderRadius:3}}>
                    <div style={{width:`${(radarData[i].puntaje/4)*100}%`,height:'100%',background:d.color,borderRadius:3}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='usuarios' && (
          <div style={{background:'#fff',borderRadius:12,overflow:'hidden',border:'1px solid #D4E0D4'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
              <thead>
                <tr style={{background:'#F0F5F0'}}>
                  <th style={{padding:'10px 14px',textAlign:'left',color:'#5A7060',fontWeight:700,borderBottom:'1px solid #D4E0D4'}}>Email</th>
                  <th style={{padding:'10px 8px',color:'#5A7060',borderBottom:'1px solid #D4E0D4'}}>Organización</th>
                  <th style={{padding:'10px 8px',color:'#5A7060',borderBottom:'1px solid #D4E0D4'}}>Estado</th>
                  <th style={{padding:'10px 8px',color:'#5A7060',borderBottom:'1px solid #D4E0D4'}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u,idx) => (
                  <tr key={u.id} style={{borderBottom:'1px solid #D4E0D4',background:idx%2===0?'#fff':'#FAFCFA'}}>
                    <td style={{padding:'8px 14px',color:'#1C2B1C'}}>{u.email}</td>
                    <td style={{padding:'8px',color:'#5A7060',fontSize:12}}>{u.org_nombre||'Admin'}</td>
                    <td style={{padding:'8px'}}>
                      <span style={{padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700,background:u.activo?'#d4edda':'#f8d7da',color:u.activo?'#155724':'#721c24'}}>
                        {u.activo?'Activo':'Inactivo'}
                      </span>
                    </td>
                    <td style={{padding:'8px',display:'flex',gap:6}}>
                      {u.rol!=='admin' && (
                        <button onClick={()=>handleToggle(u)} style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:'1px solid #D4E0D4',background:'#F3F6F3',cursor:'pointer',color:'#1C2B1C'}}>
                          {u.activo?'Desactivar':'Activar'}
                        </button>
                      )}
                      <button onClick={()=>{setEditUser(u);setNewPass('')}} style={{fontSize:11,padding:'4px 10px',borderRadius:6,border:'1px solid #D4E0D4',background:'#F3F6F3',cursor:'pointer',color:'#1C2B1C'}}>
                        Cambiar clave
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editUser && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}>
            <div style={{background:'#fff',borderRadius:12,padding:28,width:360}}>
              <h3 style={{margin:'0 0 6px',fontSize:16,color:'#1C2B1C'}}>Cambiar contraseña</h3>
              <p style={{margin:'0 0 16px',fontSize:13,color:'#5A7060'}}>{editUser.email}</p>
              <input value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Nueva contraseña" type="password"
                style={{width:'100%',boxSizing:'border-box',padding:'10px 14px',border:'1.5px solid #D4E0D4',borderRadius:8,fontSize:14,marginBottom:14,outline:'none'}} />
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>handlePass(editUser)} style={{flex:1,padding:'10px',background:'#0A5C36',border:'none',borderRadius:8,color:'#fff',fontWeight:700,cursor:'pointer'}}>Guardar</button>
                <button onClick={()=>setEditUser(null)} style={{flex:1,padding:'10px',background:'#F3F6F3',border:'1px solid #D4E0D4',borderRadius:8,cursor:'pointer'}}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
