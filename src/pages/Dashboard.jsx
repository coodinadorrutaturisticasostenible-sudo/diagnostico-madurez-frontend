import { useEffect, useState } from 'react'
import axios from 'axios'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

const API = import.meta.env.VITE_API_URL

const DIMS = [
  { key:'D1', label:'Gobernanza y Estructura', color:'#0A5C36', vars:['v1_1','v1_2','v1_3','v1_4','v1_5','v1_6'] },
  { key:'D2', label:'Gestión Estratégica', color:'#1A7A50', vars:['v2_1','v2_2','v2_3','v2_4','v2_5'] },
  { key:'D3', label:'Programas y Proyectos', color:'#2E8B57', vars:['v3_1','v3_2','v3_3'] },
  { key:'D4', label:'Gestión Financiera', color:'#B8860B', vars:['v4_1','v4_2','v4_3','v4_4','v4_5'] },
  { key:'D5', label:'Talento Humano', color:'#8B4513', vars:['v5_1','v5_2','v5_3','v5_4','v5_5'] },
  { key:'D6', label:'Comunicación Externa', color:'#1A4D8A', vars:['v6_1','v6_2','v6_3','v6_4'] },
  { key:'D7', label:'Impacto e Innovación', color:'#6A1B9A', vars:['v7_1','v7_2','v7_3'] },
]

const VAR_NAMES = {
  v1_1:'Estructura legal',v1_2:'Órgano de gobierno',v1_3:'Transparencia',v1_4:'Participación',v1_5:'Gestión de riesgos',v1_6:'Sistemas de información',
  v2_1:'Plan estratégico',v2_2:'Alineación ODS',v2_3:'Monitoreo estratégico',v2_4:'Análisis del entorno',v2_5:'Innovación',
  v3_1:'Metodologías',v3_2:'Gestión de recursos',v3_3:'Monitoreo proyectos',
  v4_1:'Gestión contable',v4_2:'Diversificación fuentes',v4_3:'Control presupuestal',v4_4:'Gestión fiscal',v4_5:'Planificación financiera',
  v5_1:'Estructura personal',v5_2:'Reclutamiento',v5_3:'Bienestar y clima',v5_4:'Desempeño',v5_5:'Voluntariado',
  v6_1:'Estrategia comunicación',v6_2:'Presencia digital',v6_3:'Alianzas',v6_4:'Imagen y reputación',
  v7_1:'Indicadores impacto',v7_2:'Análisis de datos',v7_3:'Publicaciones',
}

const levelColor = v => v>=3.5?'#0A5C36':v>=2.5?'#2E8B57':v>=1.5?'#E8A020':'#C0392B'
const levelLabel = v => v>=3.5?'Optimizado':v>=2.5?'Establecido':v>=1.5?'Básico':'Inicial'
const dimAvg = (d, data) => { const vals = d.vars.map(v => parseFloat(data[v]||0)); return vals.reduce((a,b)=>a+b,0)/vals.length }

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    axios.get(`${API}/api/diagnostico/mio`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(res => setData(res.data))
      .catch(() => window.location.href = '/')
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#F3F6F3',fontSize:16,color:'#0A5C36'}}>Cargando diagnóstico...</div>
  if (!data) return null

  const { organizacion: org, diagnostico: diag } = data
  const avgs = DIMS.map(d => dimAvg(d, diag))
  const total = avgs.reduce((a,b)=>a+b,0)/avgs.length
  const radarData = DIMS.map((d,i) => ({ dim:d.key, label:d.label, puntaje:+avgs[i].toFixed(2) }))
  const sorted = DIMS.map((d,i) => ({...d, avg:avgs[i]})).sort((a,b)=>a.avg-b.avg)

  return (
    <div style={{minHeight:'100vh',background:'#F3F6F3',fontFamily:'Segoe UI,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#063D24,#0A5C36)',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{fontSize:28}}>🌱</div>
          <div>
            <div style={{color:'#fff',fontWeight:800,fontSize:16}}>ComunApp</div>
            <div style={{color:'rgba(255,255,255,0.7)',fontSize:12}}>Diagnóstico de Madurez</div>
          </div>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href='/' }} style={{background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',padding:'7px 14px',borderRadius:7,cursor:'pointer',fontSize:13}}>Cerrar sesión</button>
      </div>

      <div style={{maxWidth:800,margin:'0 auto',padding:'24px 16px 60px'}}>
        <div style={{background:'linear-gradient(135deg,#063D24,#0A5C36)',borderRadius:14,padding:'20px 24px',marginBottom:20,color:'#fff',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <p style={{margin:'0 0 4px',fontSize:11,opacity:0.7,fontWeight:600,letterSpacing:'0.06em'}}>ORGANIZACIÓN</p>
            <h2 style={{margin:'0 0 4px',fontSize:18,fontWeight:800}}>{org.nombre}</h2>
            <p style={{margin:0,opacity:0.8,fontSize:13}}>{org.municipio} · {org.tiempo_existencia}</p>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:36,fontWeight:900}}>{total.toFixed(2)}</div>
            <div style={{fontSize:10,opacity:0.8}}>PUNTAJE / 4.00</div>
            <div style={{marginTop:4,padding:'2px 10px',borderRadius:20,background:'rgba(255,255,255,0.2)',fontSize:11,fontWeight:700}}>{levelLabel(total)}</div>
          </div>
        </div>

        <div style={{background:'#fff',borderRadius:12,padding:20,marginBottom:20,border:'1px solid #D4E0D4'}}>
          <h3 style={{margin:'0 0 16px',fontSize:13,fontWeight:700,color:'#5A7060',textTransform:'uppercase',letterSpacing:'0.06em'}}>Perfil de Madurez</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#D4E0D4" />
              <PolarAngleAxis dataKey="dim" tick={{fontSize:11,fontWeight:700,fill:'#0A5C36'}} />
              <PolarRadiusAxis domain={[0,4]} tickCount={5} tick={{fontSize:9}} />
              <Radar name="Puntaje" dataKey="puntaje" stroke="#0A5C36" fill="#0A5C36" fillOpacity={0.25} strokeWidth={2.5} />
              <Tooltip formatter={(v,n,p) => [v, p.payload.label]} contentStyle={{fontSize:12,borderRadius:8}} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div style={{background:'#fff',borderRadius:12,padding:20,marginBottom:20,border:'1px solid #D4E0D4'}}>
          <h3 style={{margin:'0 0 16px',fontSize:13,fontWeight:700,color:'#5A7060',textTransform:'uppercase',letterSpacing:'0.06em'}}>Puntajes por Dimensión</h3>
          {DIMS.map((d,i) => (
            <div key={d.key} style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                <span style={{fontSize:13,fontWeight:600,color:'#1C2B1C'}}>{d.key} · {d.label}</span>
                <span style={{fontSize:12,fontWeight:700,color:levelColor(avgs[i]),background:levelColor(avgs[i])+'18',padding:'2px 8px',borderRadius:20,border:`1px solid ${levelColor(avgs[i])}30`}}>{levelLabel(avgs[i])} {avgs[i].toFixed(2)}</span>
              </div>
              <div style={{height:7,background:'#E8EDE8',borderRadius:4}}>
                <div style={{width:`${(avgs[i]/4)*100}%`,height:'100%',background:d.color,borderRadius:4,transition:'width 0.4s'}} />
              </div>
            </div>
          ))}
        </div>

        <div style={{background:'#fff',borderRadius:12,padding:20,marginBottom:20,border:'1px solid #D4E0D4'}}>
          <h3 style={{margin:'0 0 6px',fontSize:13,fontWeight:700,color:'#5A7060',textTransform:'uppercase',letterSpacing:'0.06em'}}>Plan de Fortalecimiento</h3>
          <p style={{margin:'0 0 16px',fontSize:12,color:'#5A7060'}}>Dimensiones priorizadas por menor puntaje</p>
          {sorted.slice(0,4).map((d,idx) => (
            <div key={d.key} style={{borderLeft:`4px solid ${d.color}`,background:d.color+'08',borderRadius:'0 10px 10px 0',padding:'12px 14px',marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:11,fontWeight:700,color:d.color,textTransform:'uppercase'}}>Prioridad {idx+1} · {d.key}</span>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <span style={{fontSize:11,background:d.color+'18',color:d.color,padding:'2px 8px',borderRadius:20,fontWeight:700}}>Módulo {d.avg<=2.5?'básico':'avanzado'}</span>
                  <span style={{fontSize:16,fontWeight:800,color:d.color}}>{d.avg.toFixed(2)}</span>
                </div>
              </div>
              <p style={{margin:'0 0 6px',fontSize:13,fontWeight:600,color:'#1C2B1C'}}>{d.label}</p>
              <div style={{fontSize:12,color:'#5A7060'}}>
                <strong>Variables críticas: </strong>
                {d.vars.map(v=>({v,s:parseFloat(diag[v]||0)})).sort((a,b)=>a.s-b.s).slice(0,2).map(x=>VAR_NAMES[x.v]).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
