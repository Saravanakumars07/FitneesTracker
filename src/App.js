import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import "./App.css";
const KEY = "healthAndFitness";

 function App() {
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; } catch { return []; }
  })    ;
  const [show, setShow] = useState(false);

  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ date: "", intake: "", burned: "", description: "" });

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(data)); }, [data]);

  const openAdd = () => {
    setEditId(null);
    setForm({ date: new Date().toISOString().slice(0, 10), intake: "", burned: "", description: "" });
    setShow(true);
  };
  const openEdit = (item) => {
    setEditId(item.id);
    setForm({ date: item.date, intake: String(item.intake), burned: String(item.burned), description: item.description });
    setShow(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const entry = { id: editId || Date.now(), date: form.date, intake: Number(form.intake), burned: Number(form.burned), description: form.description };
    if (editId) setData(prev => prev.map(d => d.id === editId ? entry : d));
    else setData(prev => [...prev, entry]);
    setShow(false);
  };
  const handleDelete = (id) => setData(prev => prev.filter(d => d.id !== id));

  // CRITICAL: Last 7 CALENDAR days
  const getLast7DaysData = () => {
    const today = new Date(); today.setHours(0,0,0,0);
    const sevenAgo = new Date(today); sevenAgo.setDate(today.getDate() - 6);
    return [...data].filter(d => { 
      const dt = new Date(d.date); dt.setHours(0,0,0,0);
      return dt >= sevenAgo && dt <= today;
    }).sort((a,b)=> new Date(a.date)-new Date(b.date));
  };
  const weekData = getLast7DaysData();
  const totalIntake = data.reduce((s,d)=>s+d.intake,0);
  const totalBurned = data.reduce((s,d)=>s+d.burned,0);
  const pieData = [{name:"Intake", value: totalIntake||0.0001},{name:"Burned", value: totalBurned||0.0001}];

  return (
    <div className="app">
      <div className="header"><h1>Health And Fitness Tracker</h1></div>
      <div className="top-section">
        <div className="card"><h3>Update Today's Data</h3><button onClick={openAdd}>+ Add data</button></div>
        <div className="top-right">
          {<div className="top-right">
  {weekData.length===0 ? <span className="no-data-text">No data available</span> :
    <div className="weekly-chart-box"><h3>Weekly Health Trends</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={weekData}><CartesianGrid strokeDasharray="3 3" stroke="#777"/><XAxis dataKey="date" tick={{fontSize:10, fill:"#fff"}}/><YAxis tick={{fontSize:10, fill:"#fff"}}/><Tooltip/><Bar dataKey="intake" fill="#8b8bff"/><Bar dataKey="burned" fill="#82ca9d"/></BarChart>
      </ResponsiveContainer>
    </div>
  }
</div>
          }
        </div>
      </div>
      <div className="bottom-section">
        <div className="recent">
          <h2>Recent Health Statistics</h2>
          {data.length===0 ? <p className="empty">No Progress to show!</p> :
            [...data].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(item=>(
              <div key={item.id} className="recent-item">
                <div><div className="desc">{item.description}</div><div className="vals">Calories Intake = {item.intake} Calories Burned = {item.burned}</div><div className="date-small">{item.date}</div></div>
                <div className="actions"><button className="edit" onClick={()=>openEdit(item)}>Edit</button><button className="delete" onClick={()=>handleDelete(item.id)}>Delete</button></div>
              </div>
            ))
          }
        </div>
        <div className="overall">
          <h2>Overall Data</h2>
          <div className="pie-box">
            <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={75} label><Cell fill="#a855f7"/><Cell fill="#f59e0b"/></Pie><Tooltip/></PieChart></ResponsiveContainer>
            <div className="legend"><span className="p">■ Intake</span> <span className="o">■ Burned</span></div>
          </div>
        </div>
      </div>
      {show && (
        <div className="overlay" onClick={()=>setShow(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h2>{editId ? "Let's see what you want to change!" : "Update Today's Data"}</h2>
            <form onSubmit={handleSubmit}>
              <label>Date</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} required />
              <label>Calorie Intake</label><input type="number" placeholder="Enter Today's Calorie Intake" value={form.intake} onChange={e=>setForm({...form,intake:e.target.value})} required />
              <label>Calorie Burned</label><input type="number" placeholder="Enter Today's Calorie Burned" value={form.burned} onChange={e=>setForm({...form,burned:e.target.value})} required />
              <label>Short Description</label><input type="text" placeholder="Enter a short description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
              <button type="submit">Submit</button>
              <button type="button" className="cancel" onClick={()=>setShow(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;