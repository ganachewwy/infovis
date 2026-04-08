import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import { Search, Map, ChevronRight, ChevronLeft, Menu, Share2, PlayCircle, Globe, Hexagon, Users, TrendingUp, BarChart3, Trophy, ChevronDown, ChevronUp, X, AlertCircle } from 'lucide-react';
import HexMap from './HexMap';
import { usePartyAnalysis, PartySelector, PerformanceDashboard } from './PartyAnalysisView';
import VoteShareDonut from './VoteShareDonut';

export const REGION_MAP = {
  'กรุงเทพมหานคร': 'กรุงเทพฯ',
  'กระบี่': 'ใต้', 'ชุมพร': 'ใต้', 'ตรัง': 'ใต้', 'นครศรีธรรมราช': 'ใต้', 'นราธิวาส': 'ใต้', 'ปัตตานี': 'ใต้', 'พังงา': 'ใต้', 'พัทลุง': 'ใต้', 'ภูเก็ต': 'ใต้', 'ยะลา': 'ใต้', 'ระนอง': 'ใต้', 'สงขลา': 'ใต้', 'สตูล': 'ใต้', 'สุราษฎร์ธานี': 'ใต้',
  'กาฬสินธุ์': 'อีสาน', 'ขอนแก่น': 'อีสาน', 'ชัยภูมิ': 'อีสาน', 'นครพนม': 'อีสาน', 'นครราชสีมา': 'อีสาน', 'บึงกาฬ': 'อีสาน', 'บุรีรัมย์': 'อีสาน', 'มหาสารคาม': 'อีสาน', 'มุกดาหาร': 'อีสาน', 'ยโสธร': 'อีสาน', 'ร้อยเอ็ด': 'อีสาน', 'เลย': 'อีสาน', 'สกลนคร': 'อีสาน', 'สุรินทร์': 'อีสาน', 'ศรีสะเกษ': 'อีสาน', 'หนองคาย': 'อีสาน', 'หนองบัวลำภู': 'อีสาน', 'อุดรธานี': 'อีสาน', 'อุบลราชธานี': 'อีสาน', 'อำนาจเจริญ': 'อีสาน',
  'จันทบุรี': 'ตะวันออก', 'ฉะเชิงเทรา': 'ตะวันออก', 'ชลบุรี': 'ตะวันออก', 'ตราด': 'ตะวันออก', 'ปราจีนบุรี': 'ตะวันออก', 'ระยอง': 'ตะวันออก', 'สระแก้ว': 'ตะวันออก',
  'กำแพงเพชร': 'เหนือ', 'เชียงราย': 'เหนือ', 'เชียงใหม่': 'เหนือ', 'ตาก': 'เหนือ', 'นครสวรรค์': 'เหนือ', 'น่าน': 'เหนือ', 'พะเยา': 'เหนือ', 'พิจิตร': 'เหนือ', 'พิษณุโลก': 'เหนือ', 'เพชรบูรณ์': 'เหนือ', 'แพร่': 'เหนือ', 'แม่ฮ่องสอน': 'เหนือ', 'ลำปาง': 'เหนือ', 'ลำพูน': 'เหนือ', 'สุโขทัย': 'เหนือ', 'อุตรดิตถ์': 'เหนือ',
  'กาญจนบุรี': 'กลาง', 'ชัยนาท': 'กลาง', 'นครนายก': 'กลาง', 'นครปฐม': 'กลาง', 'นนทบุรี': 'กลาง', 'ปทุมธานี': 'กลาง', 'ประจวบคีรีขันธ์': 'กลาง', 'พระนครศรีอยุธยา': 'กลาง', 'เพชรบุรี': 'กลาง', 'ราชบุรี': 'กลาง', 'ลพบุรี': 'กลาง', 'สมุทรปราการ': 'กลาง', 'สมุทรสงคราม': 'กลาง', 'สมุทรสาคร': 'กลาง', 'สระบุรี': 'กลาง', 'สิงห์บุรี': 'กลาง', 'สุพรรณบุรี': 'กลาง', 'อ่างทอง': 'กลาง', 'อุทัยธานี': 'กลาง'
};

function App() {
  const [summaryData, setSummaryData] = useState([]);
  const [constituencyData, setConstituencyData] = useState([]);
  const [partyListData, setPartyListData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedKeyArea, setSelectedKeyArea] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('ทั่วประเทศ');
  const [isRegionExpanded, setIsRegionExpanded] = useState(true);
  const [hoveredProvince, setHoveredProvince] = useState(null);
  const [activeTab, setActiveTab] = useState('constituency'); 
  const [selectedAnalysisParty, setSelectedAnalysisParty] = useState(null);
  const [rightPanelView, setRightPanelView] = useState('overview'); 
  const [isPartySidebarOpen, setIsPartySidebarOpen] = useState(false);
  // Mobile bottom sheet: 'minimized' | 'peek' | 'full'
  const [sheetState, setSheetState] = useState('minimized');
  const sheetDragRef = useRef({ startY: 0, startState: 'minimized', dragging: false });
  const sheetRef = useRef(null);
  const [sheetDragOffset, setSheetDragOffset] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/summary_winners.csv').then(r => r.text()),
      fetch('/constituency.csv').then(r => r.text()),
      fetch('/party_list.csv').then(r => r.text()),
    ]).then(([summaryText, constText, partyText]) => {
      Papa.parse(summaryText, {
        header: true, skipEmptyLines: true,
        complete: (r) => setSummaryData(r.data)
      });
      Papa.parse(constText, {
        header: true, skipEmptyLines: true,
        complete: (r) => setConstituencyData(r.data)
      });
      Papa.parse(partyText, {
        header: true, skipEmptyLines: true,
        complete: (r) => setPartyListData(r.data)
      });
    }).catch(err => console.error("Data load error:", err));
  }, []);

  const partyColors = {
    'ประชาชน': '#f97316', 'เพื่อไทย': '#ef4444', 'ภูมิใจไทย': '#1d4ed8',
    'กล้าธรรม': '#22c55e', 'พลังประชารัฐ': '#3b82f6', 'ประชาธิปัตย์': '#0ea5e9',
    'ไทยสร้างไทย': '#f59e0b', 'ไทรวมพลัง': '#ec4899', 'ประชาชาติ': '#8b5cf6',
    'รวมไทยสร้างชาติ': '#6366f1', 'โอกาสใหม่': '#14b8a6',
  };
  const getPartyColor = (p) => partyColors[p] || '#9ca3af';

  const seatCounts = useMemo(() => {
    return summaryData.reduce((acc, row) => {
      const party = row['พรรค'];
      if (party) { acc[party] = (acc[party] || 0) + 1; }
      return acc;
    }, {});
  }, [summaryData]);

  const sortedParties = useMemo(() =>
    Object.entries(seatCounts).sort((a, b) => b[1] - a[1]),
    [seatCounts]);

  const turnoutStats = useMemo(() => {
    let totalEligible = 0, totalVoted = 0, totalValid = 0;
    const byProvince = {};
    summaryData.forEach(d => {
      const eligible = parseInt(d['ผู้มีสิทธิ']) || 0;
      const voted = parseInt(d['มาใช้สิทธิ']) || 0;
      const valid = parseInt(d['คะแนนดี']) || 0;
      totalEligible += eligible;
      totalVoted += voted;
      totalValid += valid;
      const prov = d['จังหวัด'];
      if (!byProvince[prov]) byProvince[prov] = { eligible: 0, voted: 0 };
      byProvince[prov].eligible += eligible;
      byProvince[prov].voted += voted;
    });
    const totalInvalidVotes = Math.max(0, totalVoted - totalValid);
    return {
      total: totalEligible > 0 ? ((totalVoted / totalEligible) * 100).toFixed(1) : '0',
      totalEligible, totalVoted, totalInvalidVotes, byProvince
    };
  }, [summaryData]);

  const districtMargins = useMemo(() => {
    return summaryData.map(d => {
      const winnerVotes = parseInt(d['คะแนน']) || 0;
      const totalVotes = parseInt(d['คะแนนดี']) || 0;
      const margin = totalVotes > 0 ? ((winnerVotes / totalVotes) * 100).toFixed(1) : 0;
      return { ...d, margin: parseFloat(margin), winnerVotes, totalVotes };
    }).sort((a, b) => a.margin - b.margin);
  }, [summaryData]);

  const hotAreas = useMemo(() => districtMargins.filter(d => d.margin < 40), [districtMargins]);
  const powerHouses = useMemo(() => districtMargins.filter(d => d.margin >= 55), [districtMargins]);

  const selectedCandidates = useMemo(() => {
    if (!selectedDistrict) return [];
    return constituencyData
      .filter(d => d['จังหวัด'] === selectedDistrict.province && String(d['เขต']) === String(selectedDistrict.district))
      .sort((a, b) => (parseInt(b['คะแนน']) || 0) - (parseInt(a['คะแนน']) || 0));
  }, [constituencyData, selectedDistrict]);

  const partyListAggregated = useMemo(() => {
    const agg = {};
    partyListData.forEach(d => {
      const party = d['พรรค'];
      const votes = parseInt(d['คะแนน']) || 0;
      if (party && party !== '' && party !== 'UNKNOWN') {
        agg[party] = (agg[party] || 0) + votes;
      }
    });
    return Object.entries(agg).sort((a, b) => b[1] - a[1]);
  }, [partyListData]);

  const partyListSeats = useMemo(() => {
    const totalVotes = partyListAggregated.reduce((sum, [_, v]) => sum + v, 0);
    if (totalVotes === 0) return [];
    const totalSeats = 100;
    const quota = totalVotes / totalSeats;
    let allocatedSeats = 0;
    const results = partyListAggregated.map(([party, votes]) => {
      const seats = Math.floor(votes / quota);
      const remainder = votes % quota;
      allocatedSeats += seats;
      return { party, votes, seats, remainder, pct: (votes / totalVotes * 100).toFixed(1) };
    });
    const remainingSeats = totalSeats - allocatedSeats;
    if (remainingSeats > 0) {
      results.sort((a, b) => b.remainder - a.remainder).slice(0, remainingSeats).forEach(r => r.seats += 1);
    }
    return results.sort((a, b) => b.seats - a.seats || b.votes - a.votes);
  }, [partyListAggregated]);

  const partyListWinners = useMemo(() => {
    const turnoutMap = {};
    summaryData.forEach(s => {
      const p = s['จังหวัด'];
      const c = String(s['เขต'] || '').replace(/\D/g, '');
      turnoutMap[`${p}-${c}`] = { eligible: s['ผู้มีสิทธิ'], voted: s['มาใช้สิทธิ'] };
    });
    const distMap = {};
    partyListData.forEach(d => {
      const prov = d['จังหวัด'];
      const dist = String(d['เขต'] || '').replace(/\D/g, '');
      if (!prov || !dist) return;
      const key = `${prov}-${dist}`;
      const votes = parseInt(d['คะแนน']) || 0;
      if (!distMap[key] || votes > (distMap[key].คะแนน || 0)) {
        const turnout = turnoutMap[key] || {};
        distMap[key] = {
          'จังหวัด': prov, 'เขต': dist, 'พรรค': d['พรรค'], 'คะแนน': votes, 'ผู้ชนะ': d['พรรค'],
          'ผู้มีสิทธิ': turnout.eligible || 0, 'มาใช้สิทธิ': turnout.voted || 0
        };
      }
    });
    return Object.values(distMap);
  }, [partyListData, summaryData]);

  const selectedProvinceDistricts = useMemo(() => {
    if (!selectedProvince) return [];
    const baseData = activeTab === 'partylist' ? partyListWinners : summaryData;
    return baseData
      .filter(d => d['จังหวัด'] === selectedProvince)
      .sort((a, b) => {
        const na = parseInt((a['เขต'] || '0').toString().match(/\d+/)?.[0] || '0');
        const nb = parseInt((b['เขต'] || '0').toString().match(/\d+/)?.[0] || '0');
        return na - nb;
      });
  }, [summaryData, partyListWinners, selectedProvince, activeTab]);

  const selectedDistrictPartyListResults = useMemo(() => {
    if (!selectedDistrict || activeTab !== 'partylist') return [];
    return partyListData
      .filter(d => d['จังหวัด'] === selectedDistrict.province && String(d['เขต'] || '') === String(selectedDistrict.district))
      .sort((a, b) => (parseInt(b['คะแนน']) || 0) - (parseInt(a['คะแนน']) || 0));
  }, [partyListData, selectedDistrict, activeTab]);

  const totalDistrictPartyListVotes = useMemo(() => {
    return selectedDistrictPartyListResults.reduce((sum, d) => sum + (parseInt(d['คะแนน']) || 0), 0);
  }, [selectedDistrictPartyListResults]);

  const allProvinces = useMemo(() => [...new Set(summaryData.map(d => d['จังหวัด']).filter(Boolean))], [summaryData]);

  const filteredProvinces = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return allProvinces.filter(p => p.includes(searchQuery));
  }, [allProvinces, searchQuery]);

  const totalVotesCount = useMemo(() => summaryData.reduce((sum, d) => sum + (parseInt(d['คะแนนดี']) || 0), 0), [summaryData]);

  const { analysisData, partyStats } = usePartyAnalysis(summaryData, partyListData, selectedAnalysisParty);

  useEffect(() => {
    if (!selectedAnalysisParty && partyListAggregated.length > 0) {
      setSelectedAnalysisParty(partyListAggregated[0][0]);
    }
  }, [partyListAggregated, selectedAnalysisParty]);

  // ── Mobile Bottom Sheet touch handlers ─────────────────────────────────
  const SNAP = { minimized: 0, peek: 1, full: 2 };
  const SNAP_HEIGHTS = { minimized: 80, peek: 0.42, full: 0.9 }; // px or fraction of vh

  const getSheetTranslate = useCallback((state, offset = 0) => {
    const vh = window.innerHeight;
    const heights = { minimized: 80, peek: vh * 0.42, full: vh * 0.9 };
    const h = heights[state] || 80;
    const base = vh - h;
    return Math.max(0, base - offset);
  }, []);

  const onSheetTouchStart = useCallback((e) => {
    sheetDragRef.current = { startY: e.touches[0].clientY, startState: sheetState, dragging: true };
    setSheetDragOffset(0);
  }, [sheetState]);

  const onSheetTouchMove = useCallback((e) => {
    if (!sheetDragRef.current.dragging) return;
    const dy = sheetDragRef.current.startY - e.touches[0].clientY; // positive = dragging up
    setSheetDragOffset(dy);
  }, []);

  const onSheetTouchEnd = useCallback(() => {
    if (!sheetDragRef.current.dragging) return;
    sheetDragRef.current.dragging = false;
    const dy = sheetDragOffset;
    const cur = sheetDragRef.current.startState;
    // Threshold: 60px drag to change state
    if (dy > 60) {
      // swipe up → expand
      setSheetState(cur === 'minimized' ? 'peek' : 'full');
    } else if (dy < -60) {
      // swipe down → collapse
      setSheetState(cur === 'full' ? 'peek' : 'minimized');
    }
    setSheetDragOffset(0);
  }, [sheetDragOffset]);
  // ─────────────────────────────────────────────────────────────────────────

  const handleTileClick = (province, district) => {
    if (district) {
      setSelectedDistrict({ province, district: String(district) });
      setSelectedProvince(province);
      setRightPanelView('district');
      setSheetState('full'); // auto-expand on mobile when district is tapped
    } else {
      setSelectedProvince(province);
      setSelectedDistrict(null);
      setRightPanelView('province');
      if (REGION_MAP[province] && selectedRegion !== 'ทั่วประเทศ') { setSelectedRegion(REGION_MAP[province]); }
      setSheetState('peek');
    }
    setSearchQuery('');
    setSelectedKeyArea(null);
  };

  const handleSearchSelect = (province) => {
    setSelectedProvince(province);
    setSelectedDistrict(null);
    setRightPanelView('province');
    setSearchQuery(province);
  };

  const clearSelection = () => {
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setRightPanelView('overview');
  };

  const fmt = (n) => parseInt(n || 0).toLocaleString();

  // Compute sheet translateY for inline style (live drag feel)
  const sheetTranslateY = (() => {
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const heights = { minimized: 80, peek: vh * 0.42, full: vh * 0.9 };
    const h = heights[sheetState] || 80;
    const base = vh - h;
    const raw = base - sheetDragOffset;
    return Math.max(0, Math.min(vh - 80, raw));
  })();

  return (
    <div className="flex h-screen bg-[#1c1c1e] text-white font-sans overflow-hidden">
      {/* ===== LEFT SIDEBAR – desktop only ===== */}
      <div className="hidden md:flex w-80 border-r border-[#333] bg-[#222225] flex-col p-6 shadow-2xl z-10 relative">
        <div className="mb-5">
          <p className="text-gray-400 text-xs tracking-wider uppercase mb-1">#Deciding Thailand's Future</p>
          <h1 className="text-4xl font-black text-orange-500 mb-2 tracking-tighter">THAI ELECTION 2026</h1>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="col-span-2 bg-[#2a2a2d] rounded-lg p-4 border border-[#333] flex flex-col justify-center items-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 z-10">Total Valid Votes</p>
            <p className="text-3xl font-black text-white z-10">{totalVotesCount.toLocaleString()}</p>
          </div>
          <div className="bg-[#2a2a2d] rounded-lg p-3 border border-[#333]">
            <div className="flex items-center space-x-1 mb-1">
              <Users size={12} className="text-orange-400" />
              <span className="text-[10px] text-gray-400 uppercase">Turnout</span>
            </div>
            <p className="text-lg font-bold text-white">{turnoutStats.total}%</p>
          </div>
          <div className="bg-[#2a2a2d] rounded-lg p-3 border border-[#333]">
            <div className="flex items-center space-x-1 mb-1">
              <AlertCircle size={12} className="text-yellow-400" />
              <span className="text-[10px] text-gray-400 uppercase">INVALID VOTES</span>
            </div>
            <p className="text-lg font-bold text-white">{turnoutStats.totalInvalidVotes.toLocaleString()}</p>
            <p className="text-[10px] text-gray-500 font-bold">
              { ((turnoutStats.totalInvalidVotes / turnoutStats.totalVoted) * 100).toFixed(1) }% of total
            </p>
          </div>
        </div>

        <div className="mb-4 bg-[#2a2a2d] rounded border border-[#333] overflow-hidden">
          <button
            className="w-full bg-[#333] px-3 py-2 flex justify-between items-center text-white cursor-pointer hover:bg-[#444] transition-colors"
            onClick={() => setIsRegionExpanded(!isRegionExpanded)}
          >
            <span className="font-bold text-[13px] tracking-wide uppercase text-gray-400">ภูมิภาค</span>
            {isRegionExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {isRegionExpanded && (
            <div className="p-1 grid grid-cols-2 gap-1 bg-[#222225]">
              {[{ name: 'ทั่วประเทศ', count: 400 }, { name: 'กรุงเทพฯ', count: 33 }, { name: 'กลาง', count: 76 }, { name: 'ตะวันออก', count: 29 }, { name: 'เหนือ', count: 70 }, { name: 'อีสาน', count: 133 }, { name: 'ใต้', count: 59 }].map(r => (
                <div key={r.name}
                  className={`flex flex-col justify-center items-center p-2 rounded cursor-pointer transition-colors border ${selectedRegion === r.name ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'text-gray-400 border-transparent hover:bg-[#333]'}`}
                  onClick={() => { setSelectedRegion(r.name); setSelectedProvince(null); setSelectedDistrict(null); setRightPanelView('overview'); }}
                >
                  <span className="text-xs font-bold leading-tight">{r.name}</span>
                  <span className="text-[10px] text-gray-600 font-medium">{r.count} เขต</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-[#333]">
          <p className="text-[10px] text-gray-500 font-bold mb-3 uppercase tracking-widest text-center">Key areas to watch</p>
          <div className="flex flex-wrap gap-2">
            <button className={`border px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex-1 text-center shadow-sm ${selectedKeyArea === 'landslide' ? 'bg-blue-500/30 text-blue-400 border-blue-400' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20'}`}
              onClick={() => { setActiveTab('constituency'); setSelectedKeyArea(selectedKeyArea === 'landslide' ? null : 'landslide'); }}>💪 Landslide ({powerHouses.length})</button>
            <button className={`border px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex-1 text-center shadow-sm ${selectedKeyArea === 'hot' ? 'bg-red-500/30 text-red-400 border-red-400' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20'}`}
              onClick={() => { setActiveTab('constituency'); setSelectedKeyArea(selectedKeyArea === 'hot' ? null : 'hot'); }}>🔥 Hot Area ({hotAreas.length})</button>
          </div>
        </div>
      </div>

      {/* ===== CENTER MAP ===== */}
      <div className="flex-1 flex flex-col bg-[#1a1a1c] relative overflow-hidden">
        <div className="h-12 md:h-14 flex items-center border-b border-[#333] bg-[#1a1a1c]/80 backdrop-blur-md relative z-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center min-w-max px-2 md:px-0 md:justify-center md:w-full space-x-1 md:space-x-8">
            <button
              className={`font-semibold py-3 md:py-4 px-3 md:px-2 whitespace-nowrap transition-colors text-sm md:text-base touch-manipulation ${activeTab === 'constituency' ? 'text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-300'}`}
              onClick={() => { setActiveTab('constituency'); setRightPanelView('overview'); }}
            >Constituency MP</button>
            <button
              className={`font-semibold py-3 md:py-4 px-3 md:px-2 whitespace-nowrap transition-colors text-sm md:text-base touch-manipulation ${activeTab === 'partylist' ? 'text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-300'}`}
              onClick={() => { setActiveTab('partylist'); setRightPanelView('overview'); }}
            >Party-List</button>
            <button
              className={`font-semibold py-3 md:py-4 px-3 md:px-2 whitespace-nowrap transition-colors text-sm md:text-base touch-manipulation ${activeTab === 'analysis' ? 'text-white border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-300'}`}
              onClick={() => { setActiveTab('analysis'); setRightPanelView('analysis'); }}
            >Party Analysis</button>
          </div>
        </div>

        <div className="flex-1 relative z-10">
          {activeTab === 'constituency' && summaryData.length > 0 && (
            <HexMap data={summaryData} colors={partyColors} searchQuery={searchQuery} selectedProvince={selectedProvince} selectedParty={selectedParty} hoveredProvince={hoveredProvince} selectedRegion={selectedRegion} regionMap={REGION_MAP} selectedKeyArea={selectedKeyArea} onTileClick={handleTileClick} onProvinceHover={setHoveredProvince} />
          )}
          {activeTab === 'partylist' && partyListWinners.length > 0 && (
            <div className="h-full w-full relative">
              <HexMap data={partyListWinners} colors={partyColors} searchQuery={searchQuery} selectedProvince={selectedProvince} selectedParty={selectedParty} hoveredProvince={hoveredProvince} selectedRegion={selectedRegion} regionMap={REGION_MAP} onTileClick={handleTileClick} onProvinceHover={setHoveredProvince} />
              
              <div className={`absolute top-6 right-4 transition-all duration-500 z-40 flex flex-col ${isPartySidebarOpen ? 'w-64 max-h-[80%] bg-[#1e1e1e]/85 backdrop-blur-lg rounded-2xl border border-[#333] shadow-2xl overflow-hidden' : 'w-12 h-12'}`}>
                {!isPartySidebarOpen ? (
                  <button onClick={() => setIsPartySidebarOpen(true)} className="w-12 h-12 flex items-center justify-center bg-[#1e1e1e]/90 backdrop-blur-lg border border-[#333] rounded-full text-gray-400 hover:text-white hover:border-orange-500/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all duration-300 group" title="Show Party-List Votes">
                    <BarChart3 size={20} className="group-hover:scale-110 transition-transform" />
                  </button>
                ) : (
                  <>
                    <div className="p-3 border-b border-[#333] flex items-center justify-between bg-white/5">
                      <div className="flex items-center space-x-2">
                        <BarChart3 size={14} className="text-orange-500" />
                        <h3 className="text-[10px] text-gray-200 uppercase tracking-widest font-black">Party-List Votes</h3>
                      </div>
                      <button onClick={() => setIsPartySidebarOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="p-3 space-y-1.5 overflow-y-auto no-scrollbar">
                      {partyListAggregated.slice(0, 12).map(([party, votes], i) => {
                        const maxVotes = partyListAggregated[0]?.[1] || 1;
                        const pct = ((votes / maxVotes) * 100).toFixed(0);
                        return (
                          <div key={party} className="group cursor-pointer" onClick={() => setSelectedParty(selectedParty === party ? null : party)}>
                            <div className="flex justify-between items-center text-[11px] mb-1">
                              <div className="flex items-center space-x-1.5 truncate mr-2">
                                <span className="text-gray-600 font-bold w-4 text-[9px] shrink-0">{i + 1}.</span>
                                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getPartyColor(party) }}></div>
                                <span className={`font-bold transition-colors truncate ${selectedParty === party ? 'text-orange-400' : 'text-gray-200'} group-hover:text-white`}>{party}</span>
                              </div>
                              <span className="font-black text-gray-400 text-[10px] shrink-0">{votes.toLocaleString()}</span>
                            </div>
                            <div className="h-1 bg-[#1a1a1c] rounded-full overflow-hidden ml-5">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: getPartyColor(party) }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
          {activeTab === 'analysis' && analysisData && analysisData.length > 0 && (
            <div className="h-full w-full relative">
              <HexMap data={summaryData} colors={partyColors} searchQuery={searchQuery} selectedProvince={selectedProvince} selectedParty={selectedParty} hoveredProvince={hoveredProvince} selectedRegion={selectedRegion} regionMap={REGION_MAP} onTileClick={handleTileClick} onProvinceHover={setHoveredProvince} analysisMode={true} selectedAnalysisParty={selectedAnalysisParty} analysisData={analysisData} />
              <PartySelector partyListAggregated={partyListAggregated} selectedAnalysisParty={selectedAnalysisParty} setSelectedAnalysisParty={setSelectedAnalysisParty} getPartyColor={getPartyColor} />
            </div>
          )}
        </div>

        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 z-20">
          {selectedKeyArea && (
            <button className={`border px-3 py-1.5 rounded shadow text-sm font-medium transition-colors flex items-center space-x-1 ${selectedKeyArea === 'hot' ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30'}`} onClick={() => setSelectedKeyArea(null)}><X size={14} /><span>{selectedKeyArea === 'hot' ? 'Hot Areas' : 'Landslide'}</span></button>
          )}
          {selectedParty && (
            <button className="bg-orange-500/20 text-orange-400 border border-orange-500/50 px-3 py-1.5 rounded shadow text-sm font-medium hover:bg-orange-500/30 transition-colors flex items-center space-x-1" onClick={() => setSelectedParty(null)}><X size={14} /><span>{selectedParty}</span></button>
          )}
          {selectedProvince && (
            <button className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-3 py-1.5 rounded shadow text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center space-x-1" onClick={clearSelection}><X size={14} /><span>{selectedProvince}</span></button>
          )}
        </div>
      </div>

      {/* ===== RIGHT PANEL – desktop only ===== */}
      <div className="hidden md:flex w-[420px] bg-[#222225] border-l border-[#333] flex-col shadow-[-10px_0_20px_rgba(0,0,0,0.2)] z-10">
        <div className="p-5 border-b border-[#333]">
          <h2 className="text-lg font-bold text-yellow-500 mb-3 tracking-wide">Returns by districts</h2>
          <div className="relative">
            <input type="text" placeholder="ค้นหาจังหวัด..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1a1a1c] border border-[#444] text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 shadow-inner text-sm" />
            <Search className="absolute left-3 top-3 text-gray-500" size={16} />
            {filteredProvinces.length > 0 && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2d] border border-[#444] rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto">
                {filteredProvinces.map(prov => (
                  <button key={prov} onClick={() => handleSearchSelect(prov)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-500/20 hover:text-orange-400 transition-colors border-b border-[#333] last:border-b-0 flex items-center justify-between">
                    <span>{prov}</span>
                    <span className="text-xs text-gray-500">{summaryData.filter(d => d['จังหวัด'] === prov).length} เขต</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {((!selectedDistrict && activeTab === 'constituency') || (activeTab === 'partylist' && !selectedDistrict)) && (
          <div className="p-5 border-b border-[#333] bg-gradient-to-b from-[#2a2a2d] to-[#222225]">
            <h3 className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-3">
              {activeTab === 'constituency' ? 'Constituency MP Seats' : 'Party-List Seats (100)'}
            </h3>
            <div className="space-y-2">
              {activeTab === 'constituency' ? (
                sortedParties.slice(0, 10).map(([party, seats]) => (
                  <div key={party} className={`flex justify-between items-center group cursor-pointer hover:bg-white/5 p-1.5 -mx-1.5 rounded-lg transition-all duration-200 ${selectedParty === party ? 'bg-white/10 ring-1 ring-white/20' : ''} ${selectedParty && selectedParty !== party ? 'opacity-40' : ''}`} onClick={() => setSelectedParty(selectedParty === party ? null : party)}>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-sm shadow-sm transition-transform group-hover:scale-125 duration-300" style={{ backgroundColor: getPartyColor(party) }}></div>
                      <span className="font-medium text-gray-200 group-hover:text-white transition-colors text-sm">{party}</span>
                    </div>
                    <span className="font-bold text-sm">{seats} <span className="text-xs font-normal text-gray-500">seats</span></span>
                  </div>
                ))
              ) : (
                partyListSeats.slice(0, 12).map((r) => (
                  <div key={r.party} className={`flex justify-between items-start group cursor-pointer hover:bg-white/5 p-1.5 -mx-1.5 rounded-lg transition-all duration-200 ${selectedParty === r.party ? 'bg-white/10 ring-1 ring-white/20' : ''} ${selectedParty && selectedParty !== r.party ? 'opacity-40' : ''}`} onClick={() => setSelectedParty(selectedParty === r.party ? null : r.party)}>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-3 h-3 rounded-sm shadow-sm transition-transform group-hover:scale-125 duration-300" style={{ backgroundColor: getPartyColor(r.party) }}></div>
                      <span className="font-medium text-gray-200 group-hover:text-white transition-colors text-sm truncate max-w-[150px]">{r.party}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm block">{r.seats} <span className="text-xs font-normal text-gray-500">seats</span></span>
                      <span className="text-[10px] text-gray-500 font-medium">({r.pct}%)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'constituency' && rightPanelView === 'district' && selectedDistrict && (
            <>
              {(() => {
                const distData = summaryData.find(d => d['จังหวัด'] === selectedDistrict.province && String(d['เขต']) === selectedDistrict.district);
                if (!distData) return null;
                const eligible = parseInt(distData['ผู้มีสิทธิ']) || 0;
                const voted = parseInt(distData['มาใช้สิทธิ']) || 0;
                const turnout = eligible > 0 ? ((voted / eligible) * 100).toFixed(1) : '0';
                const totalValid = parseInt(distData['คะแนนดี']) || 0;
                const winnerVotes = parseInt(distData['คะแนน']) || 0;
                const margin = totalValid > 0 ? ((winnerVotes / totalValid) * 100).toFixed(1) : '0';

                return (
                  <>
                    <div className="px-5 py-6 bg-gradient-to-b from-orange-500/20 to-transparent border-b border-orange-500/10 sticky top-0 z-20 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-4">
                        <button 
                          onClick={() => { setSelectedDistrict(null); setRightPanelView('overview'); }} 
                          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-2"
                        >
                          <ChevronLeft size={12} />
                          <span>Back to Summary</span>
                        </button>
                        <button onClick={clearSelection} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white"><X size={18} /></button>
                      </div>
                      
                      <div>
                        <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.2em] mb-1">{selectedDistrict.province}</p>
                        <h3 className="font-black text-3xl text-white tracking-tighter">เขตเลือกตั้งที่ {selectedDistrict.district}</h3>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-6">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                          <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Turnout</p>
                          <p className="text-base font-black text-green-400">{turnout}%</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                          <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Winner %</p>
                          <p className={`text-base font-black ${parseFloat(margin) < 40 ? 'text-red-400' : parseFloat(margin) > 55 ? 'text-blue-400' : 'text-yellow-400'}`}>{margin}%</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                          <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Valid Votes</p>
                          <p className="text-base font-black text-white">{fmt(totalValid)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-6 bg-[#1a1a1c]/50">
                      <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-4">Vote Share Breakdown</h4>
                      <div className="bg-[#2a2a2d] rounded-2xl border border-[#333] shadow-inner flex justify-center items-center p-4">
                        <VoteShareDonut 
                          candidates={selectedCandidates} 
                          totalValid={totalValid} 
                          getPartyColor={getPartyColor} 
                        />
                      </div>
                    </div>

                    <div className="px-5 py-6">
                      <div className="flex items-center justify-between mb-5">
                         <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-black">All Candidates ({selectedCandidates.length})</h4>
                         <span className="text-[9px] text-gray-600 font-bold uppercase">Sorted by votes</span>
                      </div>
                      <div className="space-y-3">
                        {selectedCandidates.map((c, i) => {
                          const votes = parseInt(c['คะแนน']) || 0;
                          const pct = totalValid > 0 ? ((votes / totalValid) * 100).toFixed(1) : '0';
                          const isWinner = i === 0;

                          return (
                            <div 
                              key={i} 
                              className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                                isWinner 
                                ? 'bg-orange-500/10 border-orange-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.12)] ring-1 ring-orange-500/20' 
                                : 'bg-[#1e1e20] border-[#333] hover:border-[#444] hover:bg-[#252528]'
                              }`}
                            >
                              {isWinner && (
                                <div className="absolute top-4 right-4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg transform scale-110">
                                   <div className="w-3 h-3 border-b-2 border-r-2 border-white rotate-45 -mt-0.5"></div>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-4 mb-3">
                                <span className={`text-[10px] font-black w-5 text-center ${isWinner ? 'text-orange-500' : 'text-gray-500'}`}>
                                  {isWinner ? '#' : i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-black truncate ${isWinner ? 'text-white' : 'text-gray-200'}`}>{c['ชื่อผู้สมัคร']}</p>
                                  <div className="flex items-center space-x-2 mt-0.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPartyColor(c['พรรค']) }}></div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate">{c['พรรค']}</span>
                                    <span className="text-[10px] text-gray-700">#{c['หมายเลข']}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-end justify-between ml-9">
                                <div>
                                   <p className={`text-lg font-black leading-none ${isWinner ? 'text-white' : 'text-gray-300'}`}>{fmt(votes)}</p>
                                   <p className="text-[9px] text-gray-600 uppercase font-black mt-1">Total Votes</p>
                                </div>
                                <div className="text-right">
                                   <p className={`text-lg font-black leading-none ${isWinner ? 'text-orange-400' : 'text-blue-400'}`}>{pct}%</p>
                                   <p className="text-[9px] text-gray-600 uppercase font-black mt-1">Vote Share</p>
                                </div>
                              </div>
                              
                              <div className="h-1.5 bg-black/20 rounded-full overflow-hidden mt-4 ml-9">
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ease-out`} 
                                  style={{ width: `${pct}%`, backgroundColor: getPartyColor(c['พรรค']) }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}

          {rightPanelView === 'province' && selectedProvince && !selectedDistrict && (
            <>
              <div className="px-5 py-4 bg-blue-500/10 border-b border-blue-500/20 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-orange-400 mb-1 flex items-center space-x-1"><ChevronRight size={12} className="rotate-180" /><span>กลับหน้าหลัก</span></button>
                    <h3 className="font-bold text-lg text-blue-400">{selectedProvince}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400">{selectedProvinceDistricts.length} เขต</span>
                    {turnoutStats.byProvince[selectedProvince] && (
                      <p className="text-xs text-green-400">Turnout: {((turnoutStats.byProvince[selectedProvince].voted / turnoutStats.byProvince[selectedProvince].eligible) * 100).toFixed(1)}%</p>
                    )}
                  </div>
                </div>
              </div>
              {selectedProvinceDistricts.map((d, i) => {
                const distNum = d['เขต']?.toString().match(/\d+/)?.[0] || (i + 1);
                const winnerVotes = parseInt(d['คะแนน']) || 0;
                const totalValid = parseInt(d['คะแนนดี']) || 0;
                const margin = totalValid > 0 ? ((winnerVotes / totalValid) * 100).toFixed(1) : '0';
                const eligible = parseInt(d['ผู้มีสิทธิ']) || 0;
                const voted = parseInt(d['มาใช้สิทธิ']) || 0;
                const turnout = eligible > 0 ? ((voted / eligible) * 100).toFixed(1) : '0';
                return (
                  <div key={i} className="p-4 border-b border-[#333] hover:bg-[#2a2a2d] transition-all cursor-pointer group" onClick={() => handleTileClick(selectedProvince, distNum)}>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors text-sm">เขต {distNum}</h4>
                      <div className="flex items-center space-x-2"><span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${parseFloat(margin) < 40 ? 'bg-red-500/20 text-red-400' : parseFloat(margin) > 55 ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{margin}%</span><ChevronRight size={14} className="text-gray-600 group-hover:text-orange-400" /></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getPartyColor(d['พรรค']) }}></div>
                        <div>
                          <p className="font-medium text-sm text-white truncate max-w-[170px]">{d['ผู้ชนะ']}</p>
                          {activeTab !== 'partylist' && (
                            <p className="text-xs" style={{ color: getPartyColor(d['พรรค']) }}>{d['พรรค']}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right"><span className="font-bold text-green-400 text-sm">{fmt(winnerVotes)}</span><p className="text-[10px] text-gray-500">Turnout {turnout}%</p></div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {activeTab === 'partylist' && selectedDistrict && (
            <>
               {(() => {
                 const winnerColor = selectedDistrictPartyListResults[0] ? getPartyColor(selectedDistrictPartyListResults[0]['พรรค']) : '#3b82f6';
                 return (
                   <>
                     <div 
                       className="px-5 py-6 sticky top-0 z-20 backdrop-blur-md border-b"
                       style={{ 
                         background: `linear-gradient(to bottom, ${winnerColor}33, transparent)`,
                         borderColor: `${winnerColor}22`
                       }}
                     >
                 <div className="flex items-center justify-between mb-4">
                   <button 
                     onClick={() => { setSelectedDistrict(null); setRightPanelView('overview'); }} 
                     className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center space-x-2"
                   >
                     <ChevronLeft size={12} />
                     <span>Back to National Summary</span>
                   </button>
                   <button onClick={clearSelection} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white"><X size={18} /></button>
                 </div>
                 
                 <div>
                   <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mb-1">{selectedDistrict.province}</p>
                   <h3 className="font-black text-2xl text-white tracking-tighter">เขตเลือกตั้งที่ {selectedDistrict.district}</h3>
                   <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Party-List Election Results</p>
                 </div>

                 <div className="grid grid-cols-2 gap-2 mt-6">
                   <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                     <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Total Votes</p>
                     <p className="text-base font-black text-white">{fmt(totalDistrictPartyListVotes)}</p>
                   </div>
                   <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                     <p className="text-[9px] text-gray-500 uppercase font-black mb-1">District Rank</p>
                     <p className="text-base font-black text-blue-400">#1 {selectedDistrictPartyListResults[0]?.['พรรค'] || '-'}</p>
                   </div>
                 </div>
               </div>

               <div className="px-5 py-6">
                 <div className="space-y-3">
                   {selectedDistrictPartyListResults.map((p, i) => {
                     const votes = parseInt(p['คะแนน']) || 0;
                     const pct = totalDistrictPartyListVotes > 0 ? ((votes / totalDistrictPartyListVotes) * 100).toFixed(1) : '0';
                     const isWinner = i === 0;

                     return (
                       <div 
                         key={i} 
                         className={`relative p-4 rounded-2xl border transition-all duration-300 ${
                           isWinner 
                           ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20' 
                           : 'bg-[#1e1e20] border-[#333] hover:border-[#444]'
                         }`}
                       >
                         <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center space-x-3">
                             <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getPartyColor(p['พรรค']) }}></div>
                             <span className="text-sm font-black text-white">{p['พรรค']}</span>
                           </div>
                           <span className={`text-sm font-black ${isWinner ? 'text-blue-400' : 'text-gray-400'}`}>{pct}%</span>
                         </div>
                         <div className="flex items-end justify-between">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">{fmt(votes)} votes</span>
                            <div className="w-24 h-1.5 bg-black/20 rounded-full overflow-hidden">
                               <div 
                                 className="h-full rounded-full transition-all duration-1000" 
                                 style={{ width: `${pct}%`, backgroundColor: getPartyColor(p['พรรค']) }}
                               ></div>
                            </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
                  </>
                );
               })()}
            </>
          )}

          {activeTab === 'analysis' && rightPanelView === 'analysis' && (
             <PerformanceDashboard partyStats={partyStats} selectedAnalysisParty={selectedAnalysisParty} analysisData={analysisData} getPartyColor={getPartyColor} />
          )}

          {rightPanelView === 'overview' && (
            <div className="p-10 flex flex-col items-center justify-center h-full text-center opacity-40">
              <Map size={48} className="mb-4 text-gray-500" />
              <p className="text-sm font-medium">Select a province on the map<br />to see details</p>
            </div>
          )}
        </div>
      </div>

      {/* ===== MOBILE BOTTOM SHEET ===== */}
      <div
        ref={sheetRef}
        className="md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col"
        style={{
          height: '100dvh',
          transform: `translateY(${sheetTranslateY}px)`,
          transition: sheetDragRef.current?.dragging ? 'none' : 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
          willChange: 'transform',
        }}
      >
        {/* Drag handle + summary bar */}
        <div
          className="flex-shrink-0 bg-[#222225] border-t border-[#333] rounded-t-2xl shadow-2xl"
          onTouchStart={onSheetTouchStart}
          onTouchMove={onSheetTouchMove}
          onTouchEnd={onSheetTouchEnd}
          style={{ touchAction: 'none' }}
        >
          {/* Handle pill */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-[#555] rounded-full" />
          </div>
          {/* Mini Summary Bar */}
          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center space-x-3">
              <span className="text-orange-500 font-black text-sm">THAI ELECTION 2026</span>
              {summaryData.length > 0 && (
                <span className="text-xs text-gray-400">{turnoutStats.total}% Turnout</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {sheetState !== 'minimized' && (
                <button
                  onClick={() => setSheetState('minimized')}
                  className="p-2 rounded-full bg-white/5 touch-manipulation"
                ><X size={14} /></button>
              )}
              <button
                onClick={() => setSheetState(sheetState === 'minimized' ? 'peek' : sheetState === 'peek' ? 'full' : 'minimized')}
                className="p-2 rounded-full bg-white/5 touch-manipulation"
              >{sheetState === 'full' ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</button>
            </div>
          </div>
        </div>

        {/* Sheet scrollable content */}
        <div className="flex-1 bg-[#222225] overflow-y-auto">
          {/* Left sidebar content: region selector + stats */}
          <div className="px-4 pt-4 pb-2 border-b border-[#333]">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="col-span-3 bg-[#2a2a2d] rounded-lg p-3 border border-[#333] flex items-center justify-between">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Valid Votes</p>
                <p className="text-lg font-black text-white">{totalVotesCount.toLocaleString()}</p>
              </div>
              <div className="bg-[#2a2a2d] rounded-lg p-2.5 border border-[#333]">
                <p className="text-[9px] text-gray-400 uppercase mb-0.5">Turnout</p>
                <p className="text-sm font-bold text-white">{turnoutStats.total}%</p>
              </div>
              <div className="col-span-2 bg-[#2a2a2d] rounded-lg p-2.5 border border-[#333]">
                <p className="text-[9px] text-gray-400 uppercase mb-0.5">Invalid</p>
                <p className="text-sm font-bold text-white">{turnoutStats.totalInvalidVotes.toLocaleString()}</p>
              </div>
            </div>
            {/* Region chips – scrollable row */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[{ name: 'ทั่วประเทศ', count: 400 }, { name: 'กรุงเทพฯ', count: 33 }, { name: 'กลาง', count: 76 }, { name: 'ตะวันออก', count: 29 }, { name: 'เหนือ', count: 70 }, { name: 'อีสาน', count: 133 }, { name: 'ใต้', count: 59 }].map(r => (
                <button
                  key={r.name}
                  onClick={() => { setSelectedRegion(r.name); setSelectedProvince(null); setSelectedDistrict(null); setRightPanelView('overview'); setSheetState('minimized'); }}
                  className={`flex-shrink-0 flex flex-col items-center px-3 py-1.5 rounded-lg border text-xs font-bold touch-manipulation whitespace-nowrap ${selectedRegion === r.name ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'text-gray-400 border-[#333] bg-[#2a2a2d]'}`}
                >{r.name}</button>
              ))}
            </div>
          </div>

          {/* Key Areas */}
          <div className="px-4 py-3 border-b border-[#333] flex gap-2">
            <button
              className={`flex-1 border px-2 py-2 rounded-lg text-xs font-bold touch-manipulation ${selectedKeyArea === 'landslide' ? 'bg-blue-500/30 text-blue-400 border-blue-400' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}
              onClick={() => { setActiveTab('constituency'); setSelectedKeyArea(selectedKeyArea === 'landslide' ? null : 'landslide'); }}
            >💪 Landslide ({powerHouses.length})</button>
            <button
              className={`flex-1 border px-2 py-2 rounded-lg text-xs font-bold touch-manipulation ${selectedKeyArea === 'hot' ? 'bg-red-500/30 text-red-400 border-red-400' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
              onClick={() => { setActiveTab('constituency'); setSelectedKeyArea(selectedKeyArea === 'hot' ? null : 'hot'); }}
            >🔥 Hot Area ({hotAreas.length})</button>
          </div>

          {/* Right panel content: party seats */}
          {!selectedDistrict && (
            <div className="px-4 py-3 border-b border-[#333]">
              <h3 className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-2">
                {activeTab === 'constituency' ? 'Constituency MP Seats' : 'Party-List Seats'}
              </h3>
              <div className="space-y-1.5">
                {activeTab === 'constituency'
                  ? sortedParties.slice(0, 8).map(([party, seats]) => (
                    <div key={party} className={`flex justify-between items-center p-2 rounded-lg cursor-pointer touch-manipulation ${selectedParty === party ? 'bg-white/10' : 'hover:bg-white/5'}`} onClick={() => setSelectedParty(selectedParty === party ? null : party)}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getPartyColor(party) }} />
                        <span className="text-xs font-medium text-gray-200">{party}</span>
                      </div>
                      <span className="text-xs font-bold">{seats} <span className="text-gray-500">seats</span></span>
                    </div>
                  ))
                  : partyListSeats.slice(0, 8).map((r) => (
                    <div key={r.party} className={`flex justify-between items-center p-2 rounded-lg cursor-pointer touch-manipulation ${selectedParty === r.party ? 'bg-white/10' : 'hover:bg-white/5'}`} onClick={() => setSelectedParty(selectedParty === r.party ? null : r.party)}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getPartyColor(r.party) }} />
                        <span className="text-xs font-medium text-gray-200 truncate max-w-[140px]">{r.party}</span>
                      </div>
                      <span className="text-xs font-bold">{r.seats} <span className="text-gray-500">seats</span></span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* Province list / District detail */}
          {rightPanelView === 'province' && selectedProvince && !selectedDistrict && (
            <div>
              <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
                <div>
                  <button onClick={() => { clearSelection(); setSheetState('peek'); }} className="text-xs text-gray-400 flex items-center space-x-1 mb-1"><ChevronLeft size={12} /><span>กลับ</span></button>
                  <h3 className="font-bold text-base text-blue-400">{selectedProvince}</h3>
                </div>
                <span className="text-xs text-gray-400">{selectedProvinceDistricts.length} เขต</span>
              </div>
              {selectedProvinceDistricts.map((d, i) => {
                const distNum = d['เขต']?.toString().match(/\d+/)?.[0] || (i + 1);
                const winnerVotes = parseInt(d['คะแนน']) || 0;
                const totalValid = parseInt(d['คะแนนดี']) || 0;
                const margin = totalValid > 0 ? ((winnerVotes / totalValid) * 100).toFixed(1) : '0';
                return (
                  <div key={i} className="p-4 border-b border-[#333] hover:bg-[#2a2a2d] cursor-pointer touch-manipulation" onClick={() => { handleTileClick(selectedProvince, distNum); }}>
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-white text-sm">เขต {distNum}</h4>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${parseFloat(margin) < 40 ? 'bg-red-500/20 text-red-400' : parseFloat(margin) > 55 ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{margin}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getPartyColor(d['พรรค']) }} />
                      <span className="text-xs text-gray-300 truncate">{d['ผู้ชนะ']}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* District detail on mobile */}
          {rightPanelView === 'district' && selectedDistrict && activeTab === 'constituency' && (() => {
            const distData = summaryData.find(d => d['จังหวัด'] === selectedDistrict.province && String(d['เขต']) === selectedDistrict.district);
            if (!distData) return null;
            const eligible = parseInt(distData['ผู้มีสิทธิ']) || 0;
            const voted = parseInt(distData['มาใช้สิทธิ']) || 0;
            const turnout = eligible > 0 ? ((voted / eligible) * 100).toFixed(1) : '0';
            const totalValid = parseInt(distData['คะแนนดี']) || 0;
            const winnerVotes = parseInt(distData['คะแนน']) || 0;
            const margin = totalValid > 0 ? ((winnerVotes / totalValid) * 100).toFixed(1) : '0';
            return (
              <div>
                <div className="px-4 py-4 bg-gradient-to-b from-orange-500/20 to-transparent border-b border-orange-500/10">
                  <div className="flex items-center justify-between mb-3">
                    <button onClick={() => { setSelectedDistrict(null); setRightPanelView('province'); setSheetState('peek'); }} className="text-xs text-gray-400 flex items-center space-x-1 touch-manipulation"><ChevronLeft size={12} /><span>กลับ</span></button>
                    <button onClick={() => { clearSelection(); setSheetState('minimized'); }} className="p-1 touch-manipulation"><X size={16} /></button>
                  </div>
                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">{selectedDistrict.province}</p>
                  <h3 className="font-black text-2xl text-white">เขตเลือกตั้งที่ {selectedDistrict.district}</h3>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                      <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Turnout</p>
                      <p className="text-sm font-black text-green-400">{turnout}%</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                      <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Winner %</p>
                      <p className={`text-sm font-black ${parseFloat(margin) < 40 ? 'text-red-400' : parseFloat(margin) > 55 ? 'text-blue-400' : 'text-yellow-400'}`}>{margin}%</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2 text-center">
                      <p className="text-[9px] text-gray-500 uppercase font-black mb-1">Valid</p>
                      <p className="text-sm font-black text-white">{fmt(totalValid)}</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-4">
                  <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-3">All Candidates</h4>
                  <div className="space-y-2">
                    {selectedCandidates.map((c, i) => {
                      const votes = parseInt(c['คะแนน']) || 0;
                      const pct = totalValid > 0 ? ((votes / totalValid) * 100).toFixed(1) : '0';
                      const isWinner = i === 0;
                      return (
                        <div key={i} className={`p-3 rounded-xl border ${isWinner ? 'bg-orange-500/10 border-orange-500/30' : 'bg-[#1e1e20] border-[#333]'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black truncate text-white">{c['ชื่อผู้สมัคร']}</p>
                              <p className="text-[10px] font-bold mt-0.5" style={{ color: getPartyColor(c['พรรค']) }}>{c['พรรค']}</p>
                            </div>
                            <div className="text-right ml-3">
                              <p className={`text-sm font-black ${isWinner ? 'text-orange-400' : 'text-blue-400'}`}>{pct}%</p>
                              <p className="text-[10px] text-gray-500">{fmt(votes)}</p>
                            </div>
                          </div>
                          <div className="h-1 bg-black/20 rounded-full overflow-hidden mt-2">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: getPartyColor(c['พรรค']) }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Search on mobile */}
          <div className="px-4 py-3">
            <div className="relative">
              <input type="text" placeholder="ค้นหาจังหวัด..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#1a1a1c] border border-[#444] text-white rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-orange-500 transition-colors placeholder-gray-600 text-sm" />
              <Search className="absolute left-3 top-3 text-gray-500" size={14} />
              {filteredProvinces.length > 0 && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2d] border border-[#444] rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto">
                  {filteredProvinces.map(prov => (
                    <button key={prov} onClick={() => { handleSearchSelect(prov); setSheetState('peek'); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-500/20 hover:text-orange-400 transition-colors border-b border-[#333] last:border-b-0 touch-manipulation">{prov}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
