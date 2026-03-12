import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell
} from 'recharts';
import { 
  Users, Briefcase, Car, MapPin, Wallet, Upload, Download,
  ArrowUpRight, ArrowDownRight, Activity, Filter, FileText,
  Calendar, Layers, Database, UserCheck, Trees, Globe, Info, LayoutDashboard, Building2,
  Baby, GraduationCap, BriefcaseBusiness, User, Star, RefreshCw, AlertCircle
} from 'lucide-react';
import _ from 'lodash';

// --- CONFIGURATION ---
const SHEET_ID = '1VgmFJFn211_H9cjrccqXsPMBaQ5ZwuL-1fkx_UnMBZo';
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

// ข้อมูลสำรอง (Fallback) กรณีดึงจาก Google Sheet ไม่ได้
const FALLBACK_DATA_CSV = `Panel,Topic,Segment,"Mar 25","Apr 25","May 25","Jun 25","Jul 25","Aug 25","Sep 25","Oct 25","Nov 25","Dec 25","Jan 26"
AP,gender,Female,59546,59571,61989,63197,65198,69252,46850,47466,48083,48699,49316
AP,gender,Male,41990,39043,39649,39757,39695,40561,30420,31735,33050,34365,35683`;

// --- HELPER FUNCTIONS ---
const formatNumber = (num) => new Intl.NumberFormat('en-US').format(num);

const formatIncomeLabel = (label) => {
  if (!label) return "";
  const l = label.trim();
  if (l === "Less than 5,000 THB") return "< 5k";
  if (l === "5,000 - 9,999 THB") return "5k - 10k";
  if (l === "10,000 - 19,999 THB") return "10k - 20k";
  if (l === "20,000 - 29,999 THB") return "20k - 30k";
  if (l === "30,000 - 49,999 THB") return "30k - 50k";
  if (l === "50,000 - 74,999 THB") return "50k - 75k";
  if (l === "75,000 - 99,999 THB") return "75k - 100k";
  if (l === "100,000 - 149,999 THB") return "100k - 150k";
  if (l === "150,000 THB or higher") return "> 150k";
  return label;
};

const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const splitLine = (line) => {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuote = !inQuote;
      else if (char === ',' && !inQuote) {
        result.push(current);
        current = '';
      } else current += char;
    }
    result.push(current);
    return result.map(v => v.replace(/^"|"$/g, '').trim());
  };
  const headers = splitLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = splitLine(line);
    const row = {};
    headers.forEach((h, i) => row[h] = values[i] || '');
    return row;
  });
};

const getIconForTopic = (topic) => {
  switch (topic.toLowerCase()) {
    case 'overview': return <LayoutDashboard className="w-5 h-5 text-slate-700" />;
    case 'gender': return <Users className="w-5 h-5 text-blue-500" />;
    case 'age': return <Activity className="w-5 h-5 text-green-500" />;
    case 'region': return <MapPin className="w-5 h-5 text-red-500" />;
    case 'car information':
    case 'cars': 
    case 'car_owner': return <Car className="w-5 h-5 text-purple-500" />;
    case 'household_income':
    case 'personal_income': return <Wallet className="w-5 h-5 text-yellow-500" />;
    case 'employment':
    case 'occupation': return <Briefcase className="w-5 h-5 text-indigo-500" />;
    default: return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

// --- SUB-COMPONENTS ---
const SummaryCard = ({ title, value, compareValue, compareLabel, icon: Icon, colorClass }) => {
  const diff = value - compareValue;
  const pctChange = compareValue !== 0 ? ((diff / compareValue) * 100).toFixed(1) : '0.0';
  const isPositive = diff >= 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        <div className={`flex items-center text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-500'} bg-opacity-10 px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-50' : 'bg-rose-50'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {Math.abs(Number(pctChange))}%
        </div>
      </div>
      <div>
        <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-bold text-slate-800">{formatNumber(value)}</div>
        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <span>vs {compareLabel}:</span>
          <span className="font-medium text-slate-500">{formatNumber(compareValue)}</span>
        </div>
      </div>
    </div>
  );
};

const TableData = ({ data, monthA, monthB, viewMode, getPreviousMonth }) => (
  <table className="w-full text-sm">
    <thead className="sticky top-0 bg-white z-10 shadow-sm">
      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
        <th className="py-2 px-3 text-left font-semibold w-1/3 text-[10px] uppercase">Segment</th>
        {viewMode === 'compare' ? (
          <>
            <th className="py-2 px-3 text-right font-semibold text-slate-400 font-normal">{monthA}</th>
            <th className="py-2 px-3 text-right font-semibold bg-slate-50">{monthB}</th>
          </>
        ) : (
          <>
            <th className="py-2 px-3 text-right font-semibold">{monthA}</th>
            <th className="py-2 px-3 text-right font-semibold text-slate-400 font-normal border-l border-slate-100">{getPreviousMonth(monthA)}</th>
          </>
        )}
        <th className="py-2 px-3 text-right font-semibold w-1/4">Diff</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100">
      {data.map((item, idx) => (
        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
          <td className="py-3 px-3 text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{item.name}</td>
          {viewMode === 'compare' ? (
            <>
              <td className="py-3 px-3 text-right text-slate-500 font-mono">{formatNumber(item.valA)}</td>
              <td className="py-3 px-3 text-right text-slate-800 font-mono font-semibold bg-slate-50/50">{formatNumber(item.valB)}</td>
            </>
          ) : (
            <>
              <td className="py-3 px-3 text-right text-slate-800 font-mono font-semibold">{formatNumber(item.valB)}</td>
              <td className="py-3 px-3 text-right text-slate-500 font-mono border-l border-slate-100 bg-slate-50/50">{formatNumber(item.valA)}</td>
            </>
          )}
          <td className="py-3 px-3 text-right">
            <div className={`flex items-center justify-end gap-1 ${item.diff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              <span className="font-bold text-xs">{item.diff > 0 ? '+' : ''}{formatNumber(item.diff)}</span>
              {item.diff !== 0 && (item.diff > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [data, setData] = useState([]);
  const [topics, setTopics] = useState([]);
  const [panels, setPanels] = useState([]);
  const [months, setMonths] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('Overview');
  const [selectedPanel, setSelectedPanel] = useState('All');
  const [viewMode, setViewMode] = useState('single');
  const [monthA, setMonthA] = useState(''); 
  const [monthB, setMonthB] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      if (!response.ok) throw new Error('Failed to fetch data from Google Sheets');
      const csvText = await response.text();
      processData(csvText);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถโหลดข้อมูลจาก Google Sheet ได้ กรุณาตรวจสอบการแชร์ไฟล์");
      // Load fallback data
      processData(FALLBACK_DATA_CSV);
    } finally {
      setLoading(false);
    }
  };

  const processData = (csvText) => {
    const rawData = parseCSV(csvText);
    setData(rawData);
    
    const rawTopics = Array.from(new Set(rawData.map(r => r.Topic)));
    const uiTopics = ['Overview'];
    rawTopics.forEach(t => {
      if (t === 'cars' || t === 'car_owner') {
        if (!uiTopics.includes('Car Information')) uiTopics.push('Car Information');
      } else uiTopics.push(t);
    });
    setTopics(uiTopics);

    const uniquePanels = Array.from(new Set(rawData.map(r => r.Panel || 'AP')));
    setPanels(uniquePanels);

    const dateKeys = Object.keys(rawData[0]).filter(k => !['Panel', 'Topic', 'Segment'].includes(k));
    setMonths(dateKeys);

    if (dateKeys.length >= 1) {
      setMonthA(dateKeys[dateKeys.length - 1]);
      setMonthB(dateKeys.length >= 2 ? dateKeys[dateKeys.length - 2] : dateKeys[0]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMetricCount = (month, filterFn) => {
    if (!month) return 0;
    let filtered = data;
    if (selectedPanel !== 'All') filtered = filtered.filter(r => r.Panel === selectedPanel);
    return filtered.filter(filterFn).reduce((sum, r) => sum + (parseInt(r[month]) || 0), 0);
  };

  const getPreviousMonth = (cur) => {
    const idx = months.indexOf(cur);
    return idx > 0 ? months[idx - 1] : cur;
  };

  // --- Calculations ---
  const focusMetrics = useMemo(() => {
    const target = viewMode === 'compare' ? monthB : monthA;
    const compare = viewMode === 'compare' ? monthA : getPreviousMonth(monthA);
    const calc = (m) => ({
      overall: getMetricCount(m, r => r.Topic === 'gender'),
      silver: getMetricCount(m, r => r.Topic === 'age' && ['50-59', '60-69', '70-99'].includes(r.Segment)),
      auto: getMetricCount(m, r => r.Topic === 'car_owner' && r.Segment === 'Yourself'),
      rural: getMetricCount(m, r => r.Topic === 'region' && r.Segment !== 'Bangkok Metropolitan'),
      gbkk: getMetricCount(m, r => r.Topic === 'region' && r.Segment === 'Bangkok Metropolitan'),
    });
    return { current: calc(target), previous: calc(compare), label: compare };
  }, [data, monthA, monthB, viewMode, selectedPanel, months]);

  const aggregatedData = useMemo(() => {
    if (selectedTopic === 'Overview' || data.length === 0) return [];
    let filtered = selectedTopic === 'Car Information' 
      ? data.filter(r => r.Topic === 'cars' || r.Topic === 'car_owner')
      : data.filter(r => r.Topic === selectedTopic);
    
    if (selectedPanel !== 'All') filtered = filtered.filter(r => r.Panel === selectedPanel);
    
    const grouped = _.groupBy(filtered, (row) => selectedTopic === 'Car Information' ? `${row.Topic} - ${row.Segment}` : row.Segment);
    
    let result = Object.keys(grouped).map(key => {
      const rows = grouped[key];
      let segName = key;
      let origTopic = selectedTopic;
      if (selectedTopic === 'Car Information') {
        const [t, s] = key.split(' - ');
        segName = t === 'cars' ? `Qty: ${s}` : `Owner: ${s}`;
        origTopic = t;
      }
      const merged = { Topic: selectedTopic, Segment: segName, OriginalTopic: origTopic };
      months.forEach(m => merged[m] = rows.reduce((s, r) => s + (parseInt(r[m]) || 0), 0));
      return merged;
    });

    if (selectedTopic === 'household_income' || selectedTopic === 'personal_income') {
      const order = ["< 5k", "5k-10k", "10k-20k", "20k-30k", "30k-50k", "50k-75k", "75k-100k", "100k-150k", "> 150k", "Don't know", "Refused", "No Answer"];
      result.sort((a, b) => (order.indexOf(a.Segment) === -1 ? 999 : order.indexOf(a.Segment)) - (order.indexOf(b.Segment) === -1 ? 999 : order.indexOf(b.Segment)));
      result = result.map(item => ({ ...item, Segment: formatIncomeLabel(item.Segment) }));
    } else result.sort((a, b) => a.Segment.localeCompare(b.Segment));
    
    return result;
  }, [data, selectedTopic, selectedPanel, months]);

  const topicChartData = useMemo(() => {
    const targetA = viewMode === 'compare' ? monthA : getPreviousMonth(monthA);
    const targetB = viewMode === 'compare' ? monthB : monthA;
    return aggregatedData.map(row => {
      const valA = parseInt(row[targetA]) || 0;
      const valB = parseInt(row[targetB]) || 0;
      return { name: row.Segment, originalTopic: row.OriginalTopic, valA, valB, diff: valB - valA, pctChange: valA !== 0 ? ((valB - valA) / valA * 100).toFixed(1) : 'N/A' };
    });
  }, [aggregatedData, monthA, monthB, viewMode, months]);

  const genChartData = useMemo(() => {
    if (months.length === 0) return [];
    const targetA = viewMode === 'compare' ? monthA : getPreviousMonth(monthA);
    const targetB = viewMode === 'compare' ? monthB : monthA;
    let filtered = data.filter(r => r.Topic === 'age');
    if (selectedPanel !== 'All') filtered = filtered.filter(r => r.Panel === selectedPanel);
    const genMap = { 'Gen Z (18-29)': ['18-19', '20-29'], 'Gen Y (30-39)': ['30-39'], 'Gen X (40-49)': ['40-49'], 'Silver Gen (50+)': ['50-59', '60-69', '70-99'], 'Baby Boomer (60+)': ['60-69', '70-99'] };
    const genCounts = { 'Gen Z (18-29)': { vA: 0, vB: 0 }, 'Gen Y (30-39)': { vA: 0, vB: 0 }, 'Gen X (40-49)': { vA: 0, vB: 0 }, 'Silver Gen (50+)': { vA: 0, vB: 0 }, 'Baby Boomer (60+)': { vA: 0, vB: 0 } };
    filtered.forEach(r => {
      const vA = parseInt(r[targetA]) || 0; const vB = parseInt(r[targetB]) || 0;
      Object.entries(genMap).forEach(([gen, segs]) => { if (segs.includes(r.Segment)) { genCounts[gen].vA += vA; genCounts[gen].vB += vB; } });
    });
    return Object.entries(genCounts).map(([name, c]) => ({ name, valA: c.vA, valB: c.vB, diff: c.vB - c.vA, pctChange: c.vA !== 0 ? ((c.vB - c.vA) / c.vA * 100).toFixed(1) : 'N/A' }));
  }, [data, monthA, monthB, viewMode, selectedPanel, months]);

  // Overview Data
  const overviewTotalTrend = useMemo(() => {
    let filtered = data.filter(r => r.Topic === 'gender');
    if (selectedPanel !== 'All') filtered = filtered.filter(r => r.Panel === selectedPanel);
    return months.map(m => ({ name: m, Total: filtered.reduce((s, r) => s + (parseInt(r[m]) || 0), 0) }));
  }, [data, months, selectedPanel]);

  const overviewRegionData = useMemo(() => {
    if (!monthA) return [];
    let filtered = data.filter(r => r.Topic === 'region' && (selectedPanel === 'All' || r.Panel === selectedPanel));
    return Object.entries(_.groupBy(filtered, 'Segment')).map(([seg, rows]) => ({ name: seg, value: rows.reduce((s, r) => s + (parseInt(r[monthA]) || 0), 0) })).sort((a,b) => b.value - a.value);
  }, [data, monthA, selectedPanel]);

  const overviewAgeData = useMemo(() => {
    if (!monthA) return [];
    let filtered = data.filter(r => r.Topic === 'age' && (selectedPanel === 'All' || r.Panel === selectedPanel));
    return Object.entries(_.groupBy(filtered, 'Segment')).map(([seg, rows]) => ({ name: seg, value: rows.reduce((s, r) => s + (parseInt(r[monthA]) || 0), 0) }));
  }, [data, monthA, selectedPanel]);

  const overviewSESData = useMemo(() => {
    if (!monthA) return [];
    let filtered = data.filter(r => r.Topic === 'household_income' && (selectedPanel === 'All' || r.Panel === selectedPanel));
    const sesRules = { 'SES A (>75k)': ['75k-100k', '100k-150k', '> 150k', '75,000 - 99,999 THB', '100,000 - 149,999 THB', '150,000 THB or higher'], 'SES B (30k-75k)': ['30k-50k', '50k-75k', '30,000 - 49,999 THB', '50,000 - 74,999 THB'], 'SES C (10k-30k)': ['10k-20k', '20k-30k', '10,000 - 19,999 THB', '20,000 - 29,999 THB'], 'SES D (5k-10k)': ['5k-10k', '5,000 - 9,999 THB'], 'SES E (<5k)': ['< 5k', 'Less than 5,000 THB'] };
    const sesCounts = { 'SES A (>75k)': 0, 'SES B (30k-75k)': 0, 'SES C (10k-30k)': 0, 'SES D (5k-10k)': 0, 'SES E (<5k)': 0 };
    filtered.forEach(r => {
      const f = formatIncomeLabel(r.Segment);
      for (const [ses, segs] of Object.entries(sesRules)) { if (segs.includes(r.Segment) || segs.includes(f)) { sesCounts[ses] += (parseInt(r[monthA]) || 0); break; } }
    });
    return Object.entries(sesCounts).map(([name, value]) => ({ name, value }));
  }, [data, monthA, selectedPanel]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
  const SES_COLORS = ['#1e3a8a', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];
  const getTrendData = (agg) => months.map(m => { const obj = { name: m }; agg.forEach(r => obj[r.Segment] = parseInt(r[m]) || 0); return obj; });

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Header with Connection Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-blue-600" />
            Panelist Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500' : error ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
            <p className="text-slate-500 text-sm">
              {loading ? 'กำลังดึงข้อมูลจาก Google Sheets...' : error ? error : `เชื่อมต่อ Google Sheet แล้ว (อัปเดตล่าสุด: ${lastUpdated})`}
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
           <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm transition-all">
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> รีเฟรชข้อมูล
           </button>
           <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all">
            <Globe className="w-4 h-4" /> Live Sheet
           </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-bold">เชื่อมต่อข้อมูลไม่สำเร็จ</p>
            <p className="text-sm">กรุณาตั้งค่า Google Sheet เป็น "Anyone with the link can view" และลองรีเฟรชอีกครั้ง</p>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Database className="w-3 h-3" /> Panel Source</label>
              <div className="flex bg-slate-100 p-1 rounded-lg inline-flex">
                <button onClick={() => setSelectedPanel('All')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${selectedPanel === 'All' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All</button>
                {panels.map(p => <button key={p} onClick={() => setSelectedPanel(p)} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${selectedPanel === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{p}</button>)}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Layers className="w-3 h-3" /> View Mode</label>
              <div className="flex bg-slate-100 p-1 rounded-lg inline-flex">
                <button onClick={() => setViewMode('single')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${viewMode === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Single</button>
                <button onClick={() => setViewMode('compare')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${viewMode === 'compare' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Compare</button>
              </div>
            </div>
          </div>
          <div className="flex-grow flex gap-4 w-full lg:w-auto">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Month A</label>
              <select value={monthA} onChange={(e) => setMonthA(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm">
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            {viewMode === 'compare' && (
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Month B</label>
                <select value={monthB} onChange={(e) => setMonthB(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm">
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="flex flex-wrap gap-2">
            {topics.map(t => (
              <button key={t} onClick={() => setSelectedTopic(t)} className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-all border ${selectedTopic === t ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {getIconForTopic(t)} <span className="capitalize">{t.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Focus Category Summary */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard title="Overall" value={focusMetrics.current.overall} compareValue={focusMetrics.previous.overall} compareLabel={focusMetrics.label} icon={Users} colorClass="bg-blue-500" />
          <SummaryCard title="Silver Gen" value={focusMetrics.current.silver} compareValue={focusMetrics.previous.silver} compareLabel={focusMetrics.label} icon={UserCheck} colorClass="bg-orange-500" />
          <SummaryCard title="Auto Users" value={focusMetrics.current.auto} compareValue={focusMetrics.previous.auto} compareLabel={focusMetrics.label} icon={Car} colorClass="bg-purple-500" />
          <SummaryCard title="GBKK Area" value={focusMetrics.current.gbkk} compareValue={focusMetrics.previous.gbkk} compareLabel={focusMetrics.label} icon={Building2} colorClass="bg-indigo-500" />
          <SummaryCard title="Rural Area" value={focusMetrics.current.rural} compareValue={focusMetrics.previous.rural} compareLabel={focusMetrics.label} icon={Trees} colorClass="bg-emerald-500" />
        </div>
      </div>

      {/* Content Area */}
      {selectedTopic === 'Overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500" /> Active Panelists Trend</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overviewTotalTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs><linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="name" tick={{fontSize: 12}} /><YAxis tick={{fontSize: 12}} /><CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} /><Area type="monotone" dataKey="Total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
            <h3 className="text-md font-bold text-slate-700 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" /> Generation Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr><th className="py-2 px-4 text-left font-semibold">Generation</th><th className="py-2 px-4 text-right font-semibold">{viewMode === 'compare' ? monthB : monthA}</th>{viewMode === 'compare' && <th className="py-2 px-4 text-right font-semibold">{monthA}</th>}<th className="py-2 px-4 text-right font-semibold">Diff</th><th className="py-2 px-4 text-right font-semibold">% Change</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {genChartData.map((gen, idx) => {
                    const isPos = gen.diff >= 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50"><td className="py-3 px-4 font-medium text-slate-700">{gen.name}</td><td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">{formatNumber(gen.valB)}</td>{viewMode === 'compare' && <td className="py-3 px-4 text-right font-mono text-slate-50">{formatNumber(gen.valA)}</td>}<td className={`py-3 px-4 text-right font-medium ${isPos ? 'text-emerald-600' : 'text-rose-500'}`}>{isPos ? '+' : ''}{formatNumber(gen.diff)}</td><td className={`py-3 px-4 text-right font-medium ${isPos ? 'text-emerald-600' : 'text-rose-500'}`}>{gen.pctChange}%</td></tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-red-500" /> Regional Distribution</h3><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={overviewRegionData} margin={{ right: 30, left: 40 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} /><Tooltip /><Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} /></BarChart></ResponsiveContainer></div></div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100"><h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-green-500" /> Age Distribution</h3><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={overviewAgeData} margin={{ right: 30, left: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={50} tick={{fontSize: 11}} /><Tooltip /><Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20}>{overviewAgeData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div></div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 lg:col-span-2"><h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-yellow-500" /> Household Income by SES</h3><div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={overviewSESData} margin={{ left: 20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 11}} /><YAxis tick={{fontSize: 11}} /><Tooltip /><Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>{overviewSESData.map((e, i) => <Cell key={i} fill={SES_COLORS[i % SES_COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div></div>
        </div>
      ) : (
        <div className="space-y-8">
           {selectedTopic === 'Car Information' ? (
             <>
               <CarSubSection title="Number of Cars" data={topicChartData.filter(d => d.originalTopic === 'cars')} trendData={getTrendData(aggregatedData.filter(d => d.OriginalTopic === 'cars'))} aggData={aggregatedData.filter(d => d.OriginalTopic === 'cars')} monthA={monthA} monthB={monthB} viewMode={viewMode} getPreviousMonth={getPreviousMonth} COLORS={COLORS} />
               <div className="pt-6 border-t border-slate-200">
                 <CarSubSection title="Car Ownership" data={topicChartData.filter(d => d.originalTopic === 'car_owner')} trendData={getTrendData(aggregatedData.filter(d => d.OriginalTopic === 'car_owner'))} aggData={aggregatedData.filter(d => d.OriginalTopic === 'car_owner')} monthA={monthA} monthB={monthB} viewMode={viewMode} getPreviousMonth={getPreviousMonth} COLORS={COLORS} />
               </div>
             </>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-100 flex flex-col">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">{getIconForTopic(selectedTopic)}<span>{selectedTopic.replace('_', ' ')}</span></h2>
                  <div className="overflow-auto flex-grow h-[500px] mt-4"><TableData data={topicChartData} monthA={monthA} monthB={monthB} viewMode={viewMode} getPreviousMonth={getPreviousMonth}/></div>
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white p-5 rounded-xl border border-slate-100"><h3 className="font-bold mb-4">Distribution</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={topicChartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 11}} /><YAxis tick={{fontSize: 11}} /><Tooltip /><Legend />{viewMode === 'compare' ? (<><Bar dataKey="valA" name={monthA} fill="#cbd5e1" radius={[4, 4, 0, 0]} /><Bar dataKey="valB" name={monthB} fill="#3b82f6" radius={[4, 4, 0, 0]} /></>) : (<Bar dataKey="valB" name={monthA} fill="#3b82f6" radius={[4, 4, 0, 0]} />)}</BarChart></ResponsiveContainer></div></div>
                  <div className="bg-white p-5 rounded-xl border border-slate-100"><h3 className="font-bold mb-4">Historical Trend</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={getTrendData(aggregatedData)}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 11}} /><YAxis tick={{fontSize: 11}} /><Tooltip /><Legend />{aggregatedData.map((s, i) => <Line key={s.Segment} type="monotone" dataKey={s.Segment} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{r: 3}} />)}</LineChart></ResponsiveContainer></div></div>
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}

const CarSubSection = ({ title, data, trendData, aggData, monthA, monthB, viewMode, getPreviousMonth, COLORS }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-slate-100 flex flex-col">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">{getIconForTopic(title)}<span>{title} Data</span></h2>
      <div className="overflow-auto flex-grow h-[250px] mt-4"><TableData data={data} monthA={monthA} monthB={monthB} viewMode={viewMode} getPreviousMonth={getPreviousMonth}/></div>
    </div>
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-100"><h3 className="font-bold mb-4">{title} Distribution</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 11}} /><YAxis tick={{fontSize: 11}} /><Tooltip /><Legend />{viewMode === 'compare' ? (<><Bar dataKey="valA" name={monthA} fill="#cbd5e1" radius={[4, 4, 0, 0]} /><Bar dataKey="valB" name={monthB} fill="#3b82f6" radius={[4, 4, 0, 0]} /></>) : (<Bar dataKey="valB" name={monthA} fill="#3b82f6" radius={[4, 4, 0, 0]} />)}</BarChart></ResponsiveContainer></div></div>
      <div className="bg-white p-5 rounded-xl border border-slate-100"><h3 className="font-bold mb-4">{title} - Trend</h3><div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{fontSize: 11}} /><YAxis tick={{fontSize: 11}} /><Tooltip /><Legend />{aggData.map((s, i) => <Line key={s.Segment} type="monotone" dataKey={s.Segment} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{r: 3}} />)}</LineChart></ResponsiveContainer></div></div>
    </div>
  </div>
);