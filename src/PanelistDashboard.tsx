import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, Briefcase, Car, MapPin, Wallet, Upload, Download,
  ArrowUpRight, ArrowDownRight, Activity, Filter, FileText,
  Calendar, Layers, Database, UserCheck, Trees, Globe, Info, LayoutDashboard, Building2,
  Baby, GraduationCap, BriefcaseBusiness, User, Star, Cat
} from 'lucide-react';
import _ from 'lodash';

// --- INITIAL DATA COMBINED (AP + MEOW) ---
// AP Logic: Aug 25 Peak (~110k) -> Sep 25 Drop 25% -> Recover linearly to Jan 26 (~85k).
// Meow Logic: Based on May 25 Real Sample (~10.8k), growing organically with ~5% fluctuation.
const INITIAL_DATA_CSV = `Panel,Topic,Segment,"Mar 25","Apr 25","May 25","Jun 25","Jul 25","Aug 25","Sep 25","Oct 25","Nov 25","Dec 25","Jan 26"
AP,gender,Female,59546,59571,61989,63197,65198,69252,46850,47466,48083,48699,49316
AP,gender,Male,41990,39043,39649,39757,39695,40561,30420,31735,33050,34365,35683
AP,age,18-19,11549,11369,12243,12462,13015,13457,3442,3487,3532,3578,3624
AP,age,20-29,46728,45365,47352,48091,49155,51662,38088,38589,39090,39591,40093
AP,age,30-39,25337,25045,25267,25470,25722,27129,20346,21485,22624,23763,24904
AP,age,40-49,11504,11796,11800,11944,12112,12561,9420,9907,10394,10882,11370
AP,age,50-59,3457,3461,3420,3440,3432,3540,2655,2899,3143,3387,3631
AP,age,60-69,1014,1009,985,979,959,985,738,805,873,941,1009
AP,age,70-99,1947,569,571,567,497,479,346,350,355,360,365
AP,region,Bangkok Metropolitan,34463,30793,26264,33907,34227,36436,27327,29143,30959,32775,34592
AP,region,Sub-Central,11201,13702,10451,11742,12119,12623,8294,8403,8512,8621,8731
AP,region,Northern,9179,8868,8669,9626,9945,10349,6473,6558,6643,6728,6814
AP,region,Northeastern,23150,22225,20741,23630,24078,24810,15299,15500,15701,15903,16105
AP,region,Eastern,8654,7753,7286,8253,8522,9036,6369,6453,6537,6621,6705
AP,region,Western,3807,3773,3535,3944,4060,4202,2809,2846,2883,2920,2957
AP,region,Southern,11081,11500,10769,11851,11941,12359,8637,8750,8864,8978,9092
AP,cars,0,,19030,20033,20338,21232,22174,16630,18197,19764,21331,22898
AP,cars,1,,34676,36146,36583,37981,39987,29990,31067,32145,33222,34300
AP,cars,2,,13631,14400,14582,14889,15730,11797,13216,14635,16054,17474
AP,cars,3 or more,,7309,7870,7975,8228,8743,6557,7499,8441,9383,10325
AP,car_owner,Yourself,,20796,21470,21712,22194,23337,17502,19694,21886,24078,26270
AP,car_owner,Spouse,,4158,4330,4394,4533,4925,3693,4271,4850,5429,6008
AP,car_owner,Parent,,17023,18308,18632,19322,20474,15355,20444,25533,30623,35713
AP,employment,Employed Full-time,28705,28233,29782,30326,31722,33846,15535,15739,15943,16148,16353
AP,employment,Employed Part-time,3823,3952,4112,4198,4416,4643,2109,2137,2165,2193,2221
AP,employment,Self-employed,11401,11828,12186,12300,12701,13393,7089,7182,7275,7369,7463
AP,employment,Student,15724,15463,16902,17203,17977,18757,14067,14370,14673,14976,15279
AP,household_income,Low (<10k),25388,25917,27227,27589,28238,29378,12925,13095,13265,13435,13606
AP,household_income,Mid (10k-50k),51180,48824,50911,51438,53007,56553,23880,24194,24508,24822,25137
AP,household_income,High (>50k),9941,9723,9890,9986,10204,10733,4108,4162,4216,4270,4325
AP,household_income,"Less than 5,000 THB",14978,15047,15922,16100,16416,16912,12684,12854,13024,13194,13606
AP,household_income,"5,000 - 9,999 THB",10410,10870,11305,11489,11822,12466,9349,9519,9689,9859,11432
AP,household_income,"10,000 - 19,999 THB",18742,17457,18506,18856,19631,20853,15640,15810,15980,16150,13708
AP,household_income,"20,000 - 29,999 THB",10579,10117,10357,10433,10881,11586,8689,8859,9029,9199,6414
AP,household_income,"30,000 - 49,999 THB",11440,10749,11024,11106,11414,12057,9043,9213,9383,9553,5015
AP,household_income,"50,000 - 74,999 THB",5373,5279,5379,5427,5608,5871,4403,4573,4743,4913,2278
AP,household_income,"75,000 - 99,999 THB",1693,1729,1752,1777,1775,1909,1432,1602,1772,1942,773
AP,household_income,"100,000 - 149,999 THB",1518,1452,1459,1457,1488,1561,1171,1341,1511,1681,620
AP,household_income,"150,000 THB or higher",1357,1263,1310,1325,1321,1392,1044,1214,1384,1554,654
AP,household_income,Don't know,2524,2723,2920,2952,3028,3146,2420,2590,2760,2930,3100
AP,household_income,Refused,3860,3901,4163,4212,4365,4538,3491,3661,3831,4001,4171
AP,household_income,No Answer,19062,18027,17541,17820,17144,17522,13481,13651,13821,13991,14161
Meow,gender,Female,4850,5180,6251,6590,6950,7420,7710,8120,8450,8910,9280
Meow,gender,Male,3580,3830,4620,4860,5140,5480,5690,6010,6240,6580,6860
Meow,age,18-19,780,850,1087,1150,1210,1290,1340,1410,1470,1550,1610
Meow,age,20-29,3650,3900,4348,4580,4830,5160,5360,5650,5870,6190,6450
Meow,age,30-39,2280,2430,2717,2860,3020,3220,3350,3530,3670,3870,4030
Meow,age,40-49,1360,1460,1630,1720,1810,1930,2010,2120,2200,2320,2420
Meow,age,50-59,480,520,578,610,640,680,710,750,780,820,850
Meow,age,60-69,220,235,261,275,290,310,322,340,353,372,388
Meow,age,70-99,160,170,189,200,210,225,234,247,256,270,282
Meow,region,Bangkok Metropolitan,6550,7000,7794,8210,8660,9240,9610,10120,10530,11100,11570
Meow,region,Sub-Central,500,530,593,616,647,680,714,750,787,826,867
Meow,region,Northern,250,270,304,320,340,360,375,395,410,432,450
Meow,region,Northeastern,1230,1320,1467,1540,1630,1740,1810,1910,1980,2090,2180
Meow,region,Eastern,350,380,423,445,470,500,520,550,570,600,625
Meow,region,Western,190,205,230,242,255,272,283,298,310,327,341
Meow,region,Southern,410,440,489,515,545,580,605,637,662,698,728
Meow,cars,0,,2350,2614,2750,2900,3100,3220,3390,3530,3720,3880
Meow,cars,1,,4100,4575,4820,5080,5420,5640,5940,6180,6510,6780
Meow,cars,2,,1680,1873,1970,2080,2220,2310,2430,2530,2670,2780
Meow,cars,3 or more,,880,980,1030,1090,1160,1210,1270,1320,1390,1450
Meow,car_owner,Yourself,,3900,4348,4522,4793,5032,5283,5547,5824,6115,6420
Meow,car_owner,Spouse,,780,870,915,965,1030,1070,1130,1175,1240,1290
Meow,car_owner,Parent,,3150,3520,3710,3910,4170,4340,4570,4750,5010,5220
Meow,household_income,"< 5k",1440,1540,1712,1800,1900,2030,2110,2220,2310,2440,2540
Meow,household_income,"5k-10k",1030,1100,1223,1290,1360,1450,1510,1590,1650,1740,1810
Meow,household_income,"10k-20k",1680,1800,2001,2110,2220,2370,2460,2590,2700,2840,2960
Meow,household_income,"20k-30k",940,1010,1120,1180,1240,1330,1380,1450,1510,1590,1660
Meow,household_income,"30k-50k",1020,1090,1217,1280,1350,1440,1500,1580,1640,1730,1800
Meow,household_income,"50k-75k",500,535,594,625,660,705,735,775,805,850,885
Meow,household_income,"75k-100k",160,170,191,200,212,225,235,247,257,270,282
Meow,household_income,"100k-150k",135,145,158,166,175,187,194,205,213,224,233
Meow,household_income,"> 150k",120,130,142,150,158,168,175,184,192,202,210
`;

// --- ICONS MAPPING ---
const getIconForTopic = (topic: string) => {
  switch (topic.toLowerCase()) {
    case 'overview': return <LayoutDashboard className="w-5 h-5 text-slate-700" />;
    case 'gender': return <Users className="w-5 h-5 text-blue-500" />;
    case 'age': return <Activity className="w-5 h-5 text-blue-500" />;
    case 'region': return <MapPin className="w-5 h-5 text-blue-500" />;
    case 'car information': // Combined
    case 'cars': 
    case 'car_owner': return <Car className="w-5 h-5 text-purple-500" />;
    case 'household_income':
    case 'personal_income': return <Wallet className="w-5 h-5 text-yellow-500" />;
    case 'employment':
    case 'occupation': return <Briefcase className="w-5 h-5 text-indigo-500" />;
    default: return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Helper to shorten income labels cleanly
const formatIncomeLabel = (label: string) => {
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
  if (l.includes("Don't know")) return "Don't know";
  if (l.includes("not want")) return "Refused";
  if (l.includes("Have not answered")) return "No Answer";
  
  return label; // Fallback
};

// --- Custom CSV Parser ---
// Handles quoted values with commas correctly
const parseCSV = (csvText: string) => {
  const lines = csvText.trim().split('\n');
  
  // Helper to split a line by comma, respecting quotes
  const splitLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result.map(v => v.replace(/^"|"$/g, '').trim());
  };

  const headers = splitLine(lines[0]);
  
  const data = lines.slice(1).map(line => {
    const values = splitLine(line);
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
  
  return data;
};

// --- Summary Box Component ---
const SummaryCard = ({ title, value, compareValue, compareLabel, showCompare, icon: Icon, colorClass, viewMode }: any) => {
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
        {/* Always show reference value */}
        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <span>vs {compareLabel}:</span>
          <span className="font-medium text-slate-500">{formatNumber(compareValue)}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [panels, setPanels] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  
  // Selection state (Default viewMode = 'single', Topic = 'Overview')
  const [selectedTopic, setSelectedTopic] = useState<string>('Overview');
  const [selectedPanel, setSelectedPanel] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');
  const [monthA, setMonthA] = useState<string>(''); 
  const [monthB, setMonthB] = useState<string>(''); 

  const processData = (csvText: string) => {
    try {
      const rawData = parseCSV(csvText);
      setData(rawData);

      // Extract unique topics
      const rawTopics = Array.from(new Set(rawData.map((row: any) => row.Topic)));
      
      // Combine 'cars' and 'car_owner' into 'Car Information' for UI
      const uiTopics = ['Overview'];
      rawTopics.forEach(t => {
          if (t === 'cars' || t === 'car_owner') {
              if (!uiTopics.includes('Car Information')) uiTopics.push('Car Information');
          } else {
              uiTopics.push(t);
          }
      });
      
      setTopics(uiTopics);

      if (rawData.length > 0 && rawData[0].Panel) {
        const uniquePanels = Array.from(new Set(rawData.map((row: any) => row.Panel)));
        setPanels(uniquePanels);
      } else {
        setPanels(['AP']);
      }

      if (rawData.length > 0) {
        const keys = Object.keys(rawData[0]);
        const dateKeys = keys.filter(k => !['Panel', 'Topic', 'Segment'].includes(k));
        setMonths(dateKeys);
        
        // Default: Last month available as Current (Month A)
        if (dateKeys.length >= 1) {
          setMonthA(dateKeys[dateKeys.length - 1]); 
          // Default Compare: Previous month
          setMonthB(dateKeys.length >= 2 ? dateKeys[dateKeys.length - 2] : dateKeys[0]);
        }
      }
    } catch (error) {
      console.error("Error parsing CSV:", error);
    }
  };

  useEffect(() => {
    processData(INITIAL_DATA_CSV);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        processData(text);
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadCSV = () => {
    if (data.length === 0) return;
    
    // Convert data back to CSV string
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => headers.map(fieldName => {
        const val = String(row[fieldName]);
        // Quote strings with commas
        return val.includes(',') ? `"${val}"` : val;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'panelist_data_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getMetricCount = (month: string, filterFn: (row: any) => boolean) => {
    if (!month) return 0;
    let filtered = data;
    if (selectedPanel !== 'All') {
      filtered = filtered.filter((row: any) => row.Panel === selectedPanel);
    }
    filtered = filtered.filter(filterFn);
    return filtered.reduce((sum, row) => sum + (parseInt(row[month]) || 0), 0);
  };

  const getPreviousMonth = (currentMonth: string) => {
    const idx = months.indexOf(currentMonth);
    return idx > 0 ? months[idx - 1] : currentMonth;
  };

  // --- Data Calculations ---
  const focusMetrics = useMemo(() => {
    const targetMonth = viewMode === 'compare' ? monthB : monthA;
    const compareMonth = viewMode === 'compare' ? monthA : getPreviousMonth(monthA);

    const calc = (m: string) => ({
      overall: getMetricCount(m, (r) => r.Topic === 'gender'),
      silver: getMetricCount(m, (r) => r.Topic === 'age' && ['50-59', '60-69', '70-99'].includes(r.Segment)),
      auto: getMetricCount(m, (r) => r.Topic === 'car_owner' && r.Segment === 'Yourself'),
      rural: getMetricCount(m, (r) => r.Topic === 'region' && r.Segment !== 'Bangkok Metropolitan'),
      gbkk: getMetricCount(m, (r) => r.Topic === 'region' && r.Segment === 'Bangkok Metropolitan'),
    });

    const current = calc(targetMonth);
    const previous = calc(compareMonth);

    return { current, previous, label: compareMonth };
  }, [data, monthA, monthB, viewMode, selectedPanel, months]);

  const aggregatedData = useMemo(() => {
    if (selectedTopic === 'Overview') return [];

    // Logic to handle "Car Information" Combined Topic
    if (selectedTopic === 'Car Information') {
         // Filter for both 'cars' and 'car_owner'
         let filtered = data.filter((row: any) => row.Topic === 'cars' || row.Topic === 'car_owner');
         if (selectedPanel !== 'All') {
             filtered = filtered.filter((row: any) => row.Panel === selectedPanel);
         }
         // Group and merge
         const grouped = _.groupBy(filtered, (row) => `${row.Topic} - ${row.Segment}`);
         return Object.keys(grouped).map(key => {
             // key is "cars - 0" or "car_owner - Yourself"
             // Let's make display name nicer
             const [topic, segment] = key.split(' - ');
             let displayName = segment;
             if (topic === 'cars') displayName = `Qty: ${segment}`; 
             if (topic === 'car_owner') displayName = `Owner: ${segment}`; 

             const rows = grouped[key];
             const merged: any = { Topic: selectedTopic, Segment: displayName, OriginalTopic: topic };
             months.forEach(m => {
                 const total = rows.reduce((sum, row) => sum + (parseInt(row[m]) || 0), 0);
                 merged[m] = total;
             });
             return merged;
         });
    }

    // Normal Topics
    let filtered = data.filter((row: any) => row.Topic === selectedTopic);
    if (selectedPanel !== 'All') {
      filtered = filtered.filter((row: any) => row.Panel === selectedPanel);
    }
    const grouped = _.groupBy(filtered, 'Segment');
    let result = Object.keys(grouped).map(segment => {
      const rows = grouped[segment];
      const merged: any = { Topic: selectedTopic, Segment: segment };
      months.forEach(m => {
        const total = rows.reduce((sum, row) => sum + (parseInt(row[m]) || 0), 0);
        merged[m] = total;
      });
      return merged;
    });

    // Custom Sorting
    if (selectedTopic === 'household_income' || selectedTopic === 'personal_income') {
      const order = [
        "< 5k",
        "5k-10k",
        "10k-20k",
        "20k-30k",
        "30k-50k",
        "50k-75k",
        "75k-100k",
        "100k-150k",
        "> 150k",
        "Don't know",
        "Refused",
        "No Answer"
      ];
      result.sort((a, b) => {
        let idxA = order.indexOf(a.Segment);
        let idxB = order.indexOf(b.Segment);
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
      });
      
      // Update names
      result = result.map(item => ({
        ...item,
        Segment: formatIncomeLabel(item.Segment)
      }));
    } else {
        result.sort((a, b) => a.Segment.localeCompare(b.Segment));
    }

    return result;
  }, [data, selectedTopic, selectedPanel, months]);

  const topicChartData = useMemo(() => {
    const targetA = viewMode === 'compare' ? monthA : getPreviousMonth(monthA);
    const targetB = viewMode === 'compare' ? monthB : monthA;

    return aggregatedData.map((row: any) => {
      const valA = parseInt(row[targetA]) || 0; 
      const valB = parseInt(row[targetB]) || 0; 
      
      const diff = valB - valA;
      const pctChange = valA !== 0 ? ((diff / valA) * 100).toFixed(1) : 'N/A';
      
      return {
        name: row.Segment,
        originalTopic: row.OriginalTopic, // Pass down for splitting logic
        valA: valA,
        valB: valB,
        diff: diff,
        pctChange: pctChange,
      };
    });
  }, [aggregatedData, monthA, monthB, viewMode, months]);

  // Split topicChartData for Car Info (for tables)
  const carQtyChartData = useMemo(() => {
      if (selectedTopic !== 'Car Information') return [];
      return topicChartData.filter(d => d.originalTopic === 'cars');
  }, [topicChartData, selectedTopic]);

  const carOwnerChartData = useMemo(() => {
      if (selectedTopic !== 'Car Information') return [];
      return topicChartData.filter(d => d.originalTopic === 'car_owner');
  }, [topicChartData, selectedTopic]);

  // Split aggregatedData for Car Info (for trends)
  const carQtyAggData = useMemo(() => {
      if (selectedTopic !== 'Car Information') return [];
      return aggregatedData.filter((d: any) => d.OriginalTopic === 'cars');
  }, [aggregatedData, selectedTopic]);

  const carOwnerAggData = useMemo(() => {
      if (selectedTopic !== 'Car Information') return [];
      return aggregatedData.filter((d: any) => d.OriginalTopic === 'car_owner');
  }, [aggregatedData, selectedTopic]);


  // Helper for trend data generation
  const getTrendData = (aggData: any[]) => {
      if (months.length === 0 || aggData.length === 0) return [];
      return months.map(m => {
        const monthObj: any = { name: m };
        aggData.forEach((row: any) => {
          monthObj[row.Segment] = parseInt(row[m]) || 0;
        });
        return monthObj;
      });
  };

  const topicTrendData = useMemo(() => {
      // For normal topics
      if (selectedTopic !== 'Car Information') {
          return getTrendData(aggregatedData);
      }
      return []; // Not used for Car Info (split instead)
  }, [months, aggregatedData, selectedTopic]);

  const carQtyTrendData = useMemo(() => getTrendData(carQtyAggData), [carQtyAggData, months]);
  const carOwnerTrendData = useMemo(() => getTrendData(carOwnerAggData), [carOwnerAggData, months]);

  // Generation Data Logic for "Age" Topic & Overview
  const genChartData = useMemo(() => {
    // This now works even if 'age' is not the selected topic, for Overview
    if (months.length === 0) return [];

    const targetA = viewMode === 'compare' ? monthA : getPreviousMonth(monthA);
    const targetB = viewMode === 'compare' ? monthB : monthA;
    
    // Filter age data
    let filtered = data.filter((row: any) => row.Topic === 'age');
    if (selectedPanel !== 'All') {
      filtered = filtered.filter((row: any) => row.Panel === selectedPanel);
    }

    const genMap = {
      'Gen Z (18-29)': ['18-19', '20-29'],
      'Gen Y (30-39)': ['30-39'],
      'Gen X (40-49)': ['40-49'],
      'Silver Gen (50+)': ['50-59', '60-69', '70-99'],
      'Baby Boomer (60+)': ['60-69', '70-99']
    };

    const genCounts = { 
        'Gen Z (18-29)': { valA: 0, valB: 0 },
        'Gen Y (30-39)': { valA: 0, valB: 0 },
        'Gen X (40-49)': { valA: 0, valB: 0 },
        'Silver Gen (50+)': { valA: 0, valB: 0 },
        'Baby Boomer (60+)': { valA: 0, valB: 0 }
    };

    filtered.forEach((row: any) => {
      const seg = row.Segment;
      const vA = parseInt(row[targetA]) || 0;
      const vB = parseInt(row[targetB]) || 0;

      for (const [gen, segments] of Object.entries(genMap)) {
        if (segments.includes(seg)) {
          genCounts[gen as keyof typeof genCounts].valA += vA;
          genCounts[gen as keyof typeof genCounts].valB += vB;
          // Don't break, because 60-69 belongs to BOTH Silver Gen and Baby Boomer
        }
      }
    });

    return Object.entries(genCounts).map(([name, counts]) => {
        const diff = counts.valB - counts.valA;
        const pctChange = counts.valA !== 0 ? ((diff / counts.valA) * 100).toFixed(1) : 'N/A';
        return {
            name,
            valA: counts.valA,
            valB: counts.valB,
            diff,
            pctChange
        };
    });
  }, [data, monthA, monthB, viewMode, selectedPanel, months]);


  // Overview Charts Data
  const overviewTotalTrend = useMemo(() => {
    if (months.length === 0) return [];
    let filtered = data.filter((row: any) => row.Topic === 'gender');
    if (selectedPanel !== 'All') filtered = filtered.filter((row: any) => row.Panel === selectedPanel);

    return months.map(m => {
      const total = filtered.reduce((sum, row) => sum + (parseInt(row[m]) || 0), 0);
      return { name: m, Total: total };
    });
  }, [data, months, selectedPanel]);

  const overviewRegionData = useMemo(() => {
    if (!monthA) return [];
    let filtered = data.filter((row: any) => row.Topic === 'region');
    if (selectedPanel !== 'All') filtered = filtered.filter((row: any) => row.Panel === selectedPanel);
    
    const grouped = _.groupBy(filtered, 'Segment');
    return Object.keys(grouped).map(seg => ({
      name: seg,
      value: grouped[seg].reduce((sum, r) => sum + (parseInt(r[monthA]) || 0), 0)
    })).sort((a, b) => b.value - a.value);
  }, [data, monthA, selectedPanel]);

  const overviewAgeData = useMemo(() => {
    if (!monthA) return [];
    let filtered = data.filter((row: any) => row.Topic === 'age');
    if (selectedPanel !== 'All') filtered = filtered.filter((row: any) => row.Panel === selectedPanel);
    
    const grouped = _.groupBy(filtered, 'Segment');
    return Object.keys(grouped).map(seg => ({
      name: seg,
      value: grouped[seg].reduce((sum, r) => sum + (parseInt(r[monthA]) || 0), 0)
    }));
  }, [data, monthA, selectedPanel]);

  // --- SES Calculation Logic (Robust string matching for SHORT labels) ---
  const overviewSESData = useMemo(() => {
    if (!monthA) return [];
    
    // Filter household_income
    let filtered = data.filter((row: any) => row.Topic === 'household_income');
    if (selectedPanel !== 'All') filtered = filtered.filter((row: any) => row.Panel === selectedPanel);

    // SES Mapping Definitions (Matches SHORT formatted labels)
    const sesRules = {
      'SES A (>75k)': ['75k-100k', '100k-150k', '> 150k', '75,000 - 99,999 THB', '100,000 - 149,999 THB', '150,000 THB or higher'], 
      'SES B (30k-75k)': ['30k-50k', '50k-75k', '30,000 - 49,999 THB', '50,000 - 74,999 THB'], 
      'SES C (10k-30k)': ['10k-20k', '20k-30k', '10,000 - 19,999 THB', '20,000 - 29,999 THB'], 
      'SES D (5k-10k)': ['5k-10k', '5,000 - 9,999 THB'], 
      'SES E (<5k)': ['< 5k', 'Less than 5,000 THB'] 
    };

    const sesCounts = { 'SES A (>75k)': 0, 'SES B (30k-75k)': 0, 'SES C (10k-30k)': 0, 'SES D (5k-10k)': 0, 'SES E (<5k)': 0 };

    filtered.forEach((row: any) => {
      // Check both raw and formatted label just in case
      const seg = row.Segment; 
      const formatted = formatIncomeLabel(seg);
      const val = parseInt(row[monthA]) || 0;
      
      for (const [ses, segments] of Object.entries(sesRules)) {
        if (segments.includes(seg) || segments.includes(formatted)) {
          sesCounts[ses as keyof typeof sesCounts] += val;
          break;
        }
      }
    });

    return Object.entries(sesCounts).map(([name, value]) => ({ name, value }));
  }, [data, monthA, selectedPanel]);

  const overviewEmploymentData = useMemo(() => {
    if (!monthA) return [];
    let filtered = data.filter((row: any) => row.Topic === 'employment');
    if (selectedPanel !== 'All') filtered = filtered.filter((row: any) => row.Panel === selectedPanel);
    
    return filtered.map((row: any) => ({
      name: row.Segment,
      value: parseInt(row[monthA]) || 0
    })).sort((a,b) => b.value - a.value).slice(0, 5);
  }, [data, monthA, selectedPanel]);

  // BLUE THEME COLORS
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];
  const SES_COLORS = ['#1e3a8a', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd']; 

  // Function to render charts based on selected topic
  const renderTopicContent = () => {
    // If Car Information, split into two completely separate sections (Table + Chart + Trend)
    if (selectedTopic === 'Car Information') {
      return (
        <div className="space-y-8">
           {/* Section 1: Number of Cars */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats Table */}
                <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {getIconForTopic('cars')}
                        <span className="capitalize">Number of Cars Data</span>
                        </h2>
                    </div>
                    <div className="overflow-auto flex-grow h-[250px]">
                        <TableData data={carQtyChartData} monthA={monthA} monthB={monthB} viewMode={viewMode} getPreviousMonth={getPreviousMonth}/>
                    </div>
                </div>
                
                {/* Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-md font-bold text-slate-700 mb-4">Number of Cars Distribution</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={carQtyChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
                                <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} />
                                <Legend />
                                {viewMode === 'compare' ? (
                                    <>
                                    <Bar dataKey="valA" name={monthA} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="valB" name={monthB} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </>
                                ) : (
                                    <Bar dataKey="valB" name={monthA} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                )}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-md font-bold text-slate-700 mb-4">Number of Cars - Historical Trend</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={carQtyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} />
                                <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                                <Tooltip />
                                <Legend />
                                {carQtyAggData.map((segment: any, index: number) => (
                                    <Line 
                                    key={segment.Segment}
                                    type="monotone" 
                                    dataKey={segment.Segment} 
                                    name={segment.Segment}
                                    stroke={COLORS[index % COLORS.length]} 
                                    strokeWidth={2}
                                    dot={{r: 3, strokeWidth: 0}}
                                    activeDot={{r: 6}}
                                    />
                                ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
           </div>

           {/* Section 2: Car Ownership */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
                {/* Stats Table */}
                <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="mb-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {getIconForTopic('car_owner')}
                        <span className="capitalize">Car Ownership Data</span>
                        </h2>
                    </div>
                    <div className="overflow-auto flex-grow h-[250px]">
                        <TableData data={carOwnerChartData} monthA={monthA} monthB={monthB} viewMode={viewMode} getPreviousMonth={getPreviousMonth}/>
                    </div>
                </div>
                
                {/* Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-md font-bold text-slate-700 mb-4">Car Ownership Distribution</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={carOwnerChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
                                <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} />
                                <Legend />
                                {viewMode === 'compare' ? (
                                    <>
                                    <Bar dataKey="valA" name={monthA} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="valB" name={monthB} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </>
                                ) : (
                                    <Bar dataKey="valB" name={monthA} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                )}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-md font-bold text-slate-700 mb-4">Car Ownership - Historical Trend</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={carOwnerTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} />
                                <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                                <Tooltip />
                                <Legend />
                                {carOwnerAggData.map((segment: any, index: number) => (
                                    <Line 
                                    key={segment.Segment}
                                    type="monotone" 
                                    dataKey={segment.Segment} 
                                    name={segment.Segment}
                                    stroke={COLORS[index % COLORS.length]} 
                                    strokeWidth={2}
                                    dot={{r: 3, strokeWidth: 0}}
                                    activeDot={{r: 6}}
                                    />
                                ))}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
           </div>
        </div>
      );
    }

    // Default Single Chart for other topics
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stats Table */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {getIconForTopic(selectedTopic)}
            <span className="capitalize">{selectedTopic.replace('_', ' ')} Data</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
            {viewMode === 'compare' 
                ? `Comparing ${monthB} vs ${monthA}` 
                : `Showing ${monthA} (vs ${getPreviousMonth(monthA)})`}
            </p>
        </div>
        <div className="overflow-auto flex-grow h-[400px]">
            <TableData data={topicChartData} monthA={monthA} monthB={monthB} viewMode={viewMode} getPreviousMonth={getPreviousMonth}/>
        </div>
        </div>

        {/* Right: Charts */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* --- GEN SUMMARY TABLE FOR AGE TOPIC --- */}
            {selectedTopic === 'age' && (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
                     <h3 className="text-md font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" /> Generation Summary
                     </h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="py-2 px-4 text-left font-semibold">Generation</th>
                                    <th className="py-2 px-4 text-right font-semibold">{viewMode === 'compare' ? monthB : monthA}</th>
                                    {viewMode === 'compare' && <th className="py-2 px-4 text-right font-semibold">{monthA}</th>}
                                    <th className="py-2 px-4 text-right font-semibold">Diff</th>
                                    <th className="py-2 px-4 text-right font-semibold">% Change</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {genChartData.map((gen, idx) => {
                                    const isPos = gen.diff >= 0;
                                    
                                    // Icon selection based on Gen
                                    let GenIcon = User;
                                    if (gen.name.includes('Gen Z')) GenIcon = GraduationCap;
                                    if (gen.name.includes('Gen Y')) GenIcon = BriefcaseBusiness;
                                    if (gen.name.includes('Silver')) GenIcon = Star;
                                    if (gen.name.includes('Baby Boomer')) GenIcon = Baby;
                                    
                                    return (
                                    <tr key={idx} className="hover:bg-slate-50">
                                        <td className="py-3 px-4 font-medium text-slate-700 flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-50 rounded-full text-blue-600">
                                                <GenIcon className="w-4 h-4" />
                                            </div>
                                            {gen.name}
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                                            {formatNumber(gen.valB)}
                                        </td>
                                        {viewMode === 'compare' && (
                                            <td className="py-3 px-4 text-right font-mono text-slate-500">
                                                {formatNumber(gen.valA)}
                                            </td>
                                        )}
                                        <td className={`py-3 px-4 text-right font-medium ${isPos ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {isPos ? '+' : ''}{formatNumber(gen.diff)}
                                        </td>
                                        <td className={`py-3 px-4 text-right font-medium ${isPos ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {gen.pctChange}%
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-md font-bold text-slate-700 mb-4">
            {viewMode === 'compare' ? `Comparison: ${monthA} vs ${monthB}` : `Distribution - ${monthA}`}
            </h3>
            <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
                <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    cursor={{fill: '#f8fafc'}}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                
                {viewMode === 'compare' ? (
                    <>
                    <Bar dataKey="valA" name={monthA} fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="valB" name={monthB} fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                    </>
                ) : (
                    <Bar dataKey="valB" name={monthA} fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                )}
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-md font-bold text-slate-700 mb-4 flex justify-between items-center">
            <span>Historical Trend ({months[0]} - {months[months.length-1]})</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded">Long-term View</span>
            </h3>
            <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={topicTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} />
                <YAxis tick={{fontSize: 11, fill: '#64748b'}} />
                <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                {aggregatedData.map((segment: any, index: number) => (
                    <Line 
                    key={segment.Segment}
                    type="monotone" 
                    dataKey={segment.Segment} 
                    name={segment.Segment}
                    stroke={COLORS[index % COLORS.length]} 
                    strokeWidth={2}
                    dot={{r: 3, strokeWidth: 0}}
                    activeDot={{r: 6}}
                    />
                ))}
                </LineChart>
            </ResponsiveContainer>
            </div>
        </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-blue-600" />
            Panelist Analytics Dashboard (Active 180d)
          </h1>
          <p className="text-slate-500 mt-1">ติดตามและเปรียบเทียบจำนวน Panelist (Actual & Forecast)</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex gap-2">
           <button onClick={handleDownloadCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition shadow-sm text-sm font-medium text-slate-700">
             <Download className="w-4 h-4 text-slate-600" /> Export CSV
           </button>
           <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 border border-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition shadow-sm">
            <Upload className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Import CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Controls */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Database className="w-3 h-3" /> Panel Source
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg inline-flex">
                <button onClick={() => setSelectedPanel('All')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${selectedPanel === 'All' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    All Panels
                  </div>
                </button>
                {panels.map(p => (
                  <button key={p} onClick={() => setSelectedPanel(p)} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${selectedPanel === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <div className="flex items-center gap-2">
                      {p === 'AP' ? <Users className="w-4 h-4" /> : null}
                      {p === 'Meow' ? <Cat className="w-4 h-4" /> : null}
                      {p}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Layers className="w-3 h-3" /> View Mode
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg inline-flex">
                <button onClick={() => setViewMode('single')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${viewMode === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Single Month</button>
                <button onClick={() => setViewMode('compare')} className={`px-4 py-1.5 text-sm rounded-md font-medium transition-all ${viewMode === 'compare' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Compare</button>
              </div>
            </div>
          </div>

          <div className="flex-grow flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {viewMode === 'single' ? 'Select Month' : 'Baseline Month (A)'}
              </label>
              <select 
                value={monthA} 
                onChange={(e) => setMonthA(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {viewMode === 'compare' && (
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Target Month (B)
                </label>
                <select 
                  value={monthB} 
                  onChange={(e) => setMonthB(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Topic Category
          </label>
          <div className="flex flex-wrap gap-2">
            {topics.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTopic(t)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-all border ${
                  selectedTopic === t 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {getIconForTopic(t)}
                <span className="capitalize">{t.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Focus Category Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">Focus Categories Summary</h2>
          <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {viewMode === 'compare' ? `Comparison: ${monthB} vs ${monthA}` : `Snapshot: ${monthA}`}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard 
            title="Overall" 
            value={focusMetrics.current.overall} 
            compareValue={focusMetrics.previous.overall}
            compareLabel={focusMetrics.label}
            showCompare={true}
            icon={Users}
            colorClass="bg-blue-500 text-blue-500"
            viewMode={viewMode}
          />
          <SummaryCard 
            title="Silver Gen (50+)" 
            value={focusMetrics.current.silver} 
            compareValue={focusMetrics.previous.silver}
            compareLabel={focusMetrics.label}
            showCompare={true}
            icon={UserCheck}
            colorClass="bg-orange-500 text-orange-500"
            viewMode={viewMode}
          />
          <SummaryCard 
            title="Auto Users" 
            value={focusMetrics.current.auto} 
            compareValue={focusMetrics.previous.auto}
            compareLabel={focusMetrics.label}
            showCompare={true}
            icon={Car}
            colorClass="bg-purple-500 text-purple-500"
            viewMode={viewMode}
          />
          <SummaryCard 
            title="GBKK Area" 
            value={focusMetrics.current.gbkk} 
            compareValue={focusMetrics.previous.gbkk}
            compareLabel={focusMetrics.label}
            showCompare={true}
            icon={Building2}
            colorClass="bg-indigo-500 text-indigo-500"
            viewMode={viewMode}
          />
          <SummaryCard 
            title="Rural Area" 
            value={focusMetrics.current.rural} 
            compareValue={focusMetrics.previous.rural}
            compareLabel={focusMetrics.label}
            showCompare={true}
            icon={Trees}
            colorClass="bg-emerald-500 text-emerald-500"
            viewMode={viewMode}
          />
        </div>
      </div>

      {/* Content Area */}
      {selectedTopic === 'Overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Trend */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> Total Active Panelists Trend
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overviewTotalTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="Total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
           {/* --- NEW GEN SUMMARY TABLE FOR OVERVIEW --- */}
           <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6 lg:col-span-2">
                 <h3 className="text-md font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" /> Generation Summary
                 </h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <tr>
                                <th className="py-2 px-4 text-left font-semibold">Generation</th>
                                <th className="py-2 px-4 text-right font-semibold">{viewMode === 'compare' ? monthB : monthA}</th>
                                {viewMode === 'compare' && <th className="py-2 px-4 text-right font-semibold">{monthA}</th>}
                                <th className="py-2 px-4 text-right font-semibold">Diff</th>
                                <th className="py-2 px-4 text-right font-semibold">% Change</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {genChartData.map((gen, idx) => {
                                const isPos = gen.diff >= 0;
                                
                                // Icon selection based on Gen
                                let GenIcon = User;
                                if (gen.name.includes('Gen Z')) GenIcon = GraduationCap;
                                if (gen.name.includes('Gen Y')) GenIcon = BriefcaseBusiness;
                                if (gen.name.includes('Silver')) GenIcon = Star;
                                if (gen.name.includes('Baby Boomer')) GenIcon = Baby;
                                
                                return (
                                <tr key={idx} className="hover:bg-slate-50">
                                    <td className="py-3 px-4 font-medium text-slate-700 flex items-center gap-2">
                                        <div className="p-1.5 bg-blue-50 rounded-full text-blue-600">
                                            <GenIcon className="w-4 h-4" />
                                        </div>
                                        {gen.name}
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                                        {formatNumber(gen.valB)}
                                    </td>
                                    {viewMode === 'compare' && (
                                        <td className="py-3 px-4 text-right font-mono text-slate-500">
                                            {formatNumber(gen.valA)}
                                        </td>
                                    )}
                                    <td className={`py-3 px-4 text-right font-medium ${isPos ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {isPos ? '+' : ''}{formatNumber(gen.diff)}
                                    </td>
                                    <td className={`py-3 px-4 text-right font-medium ${isPos ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {gen.pctChange}%
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                    </table>
                 </div>
            </div>

          {/* Regional Dist */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" /> Regional Distribution ({monthA})
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={overviewRegionData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Dist */}
          {/* Changed from Pie Chart to Bar Chart for clarity as requested */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" /> Age Group Distribution ({monthA})
            </h3>
            <div className="h-72 w-full">
               {/* Replaced Pie with Bar Chart (Funnel-like) for better clarity */}
               <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={overviewAgeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 11}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20}>
                    {overviewAgeData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SES (Socio-Economic Status) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:col-span-2">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-blue-500" /> Household Income by SES ({monthA})
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewSESData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{fontSize: 11}} />
                    <YAxis tick={{fontSize: 11}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" name="Panelists" radius={[4, 4, 0, 0]} barSize={40}>
                      {overviewSESData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={SES_COLORS[index % SES_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" /> Top Employment Status ({monthA})
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={overviewEmploymentData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* TOPIC SPECIFIC VIEW */
        renderTopicContent()
      )}
    </div>
  );
};

// Reusable Table Component
const TableData = ({ data, monthA, monthB, viewMode, getPreviousMonth }: any) => (
  <table className="w-full text-sm">
    <thead className="sticky top-0 bg-white z-10 shadow-sm">
      <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
        <th className="py-2 px-3 text-left font-semibold w-1/3">Segment</th>
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
      {data.map((item: any, idx: number) => (
        <tr key={idx} className="hover:bg-slate-50 transition-colors group">
          <td className="py-3 px-3 text-slate-700 font-medium group-hover:text-blue-600 transition-colors">
            {item.name}
          </td>
          {viewMode === 'compare' ? (
            <>
              <td className="py-3 px-3 text-right text-slate-500 font-mono">
                {formatNumber(item.valA)}
              </td>
              <td className="py-3 px-3 text-right text-slate-800 font-mono font-semibold bg-slate-50/50">
                {formatNumber(item.valB)}
              </td>
            </>
          ) : (
            <>
              <td className="py-3 px-3 text-right text-slate-800 font-mono font-semibold">
                {formatNumber(item.valB)}
              </td>
              <td className="py-3 px-3 text-right text-slate-500 font-mono border-l border-slate-100 bg-slate-50/50">
                {formatNumber(item.valA)}
              </td>
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

export default Dashboard;