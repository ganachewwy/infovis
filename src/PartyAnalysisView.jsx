import React, { useMemo } from 'react';
import { Trophy, Users, TrendingUp, ChevronRight } from 'lucide-react';

// Custom hook for processing party analysis data
export const usePartyAnalysis = (summaryData, partyListData, selectedAnalysisParty) => {
  const analysisData = useMemo(() => {
    if (!selectedAnalysisParty || partyListData.length === 0 || summaryData.length === 0) return [];

    const partyVotesMap = {};
    partyListData.forEach(d => {
      const p = d['จังหวัด'];
      const c = String(d['เขต'] || '').replace(/\D/g, '');
      const key = `${p}-${c}`;
      if (!partyVotesMap[key]) partyVotesMap[key] = [];
      partyVotesMap[key].push({ party: d['พรรค'], votes: parseInt(d['คะแนน']) || 0 });
    });

    return summaryData.map(s => {
      const prov = s['จังหวัด'];
      const dist = String(s['เขต'] || '').replace(/\D/g, '');
      const key = `${prov}-${dist}`;
      const districtPartyVotes = (partyVotesMap[key] || []).sort((a,b) => b.votes - a.votes);
      
      const targetPartyInfo = districtPartyVotes.find(v => v.party === selectedAnalysisParty);
      const partyVotes = targetPartyInfo ? targetPartyInfo.votes : 0;
      const winnerVotes = parseInt(s['คะแนน']) || 0;
      const totalValid = parseInt(s['คะแนนดี']) || 0;
      const rank = districtPartyVotes.findIndex(v => v.party === selectedAnalysisParty) + 1;
      const isWinner = s['พรรค'] === selectedAnalysisParty;
      
      const margin = totalValid > 0 ? (winnerVotes - partyVotes) / totalValid : 0;

      return {
        province: prov,
        district: dist,
        partyVotes,
        winnerVotes,
        totalValid,
        margin,
        rank: rank || (districtPartyVotes.length + 1),
        isWinner
      };
    });
  }, [selectedAnalysisParty, partyListData, summaryData]);

  const partyStats = useMemo(() => {
    if (!selectedAnalysisParty || analysisData.length === 0) return null;
    const totalVotes = analysisData.reduce((sum, d) => sum + d.partyVotes, 0);
    const wins = analysisData.filter(d => d.isWinner).length;
    const topCloseFights = analysisData
      .filter(d => !d.isWinner)
      .sort((a, b) => a.margin - b.margin)
      .slice(0, 5);
    return { totalVotes, wins, topCloseFights };
  }, [selectedAnalysisParty, analysisData]);

  return { analysisData, partyStats };
};

export const PartySelector = ({ partyListAggregated, selectedAnalysisParty, setSelectedAnalysisParty, getPartyColor }) => (
  <div className="absolute top-24 right-6 z-40 flex flex-col w-40 max-h-[60vh] bg-[#1e1e1e]/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl p-3 overflow-y-auto custom-scrollbar scroll-smooth transition-all duration-500 hover:bg-[#1e1e1e]/60">
    <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-3 px-1 flex items-center">
       <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
       Analyze Party
    </div>
    <div className="flex flex-col space-y-1.5">
      {partyListAggregated.slice(0, 20).map(([party]) => (
        <button
          key={party}
          onClick={() => setSelectedAnalysisParty(party)}
          className={`flex items-center space-x-2.5 px-2.5 py-2 rounded-xl transition-all duration-300 border w-full group ${
            selectedAnalysisParty === party 
            ? 'bg-white/10 border-white/20 text-white font-bold shadow-[0_0_15px_rgba(255,255,255,0.05)]' 
            : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: getPartyColor(party) }}></div>
          <span className="text-[10px] font-bold tracking-tight truncate">{party}</span>
        </button>
      ))}
    </div>
    <style>{`
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    `}</style>
  </div>
);

export const PerformanceDashboard = ({ partyStats, selectedAnalysisParty, analysisData, getPartyColor }) => {
  if (!partyStats) return null;
  return (
    <div className="flex-1 overflow-y-auto px-5 py-6">
      <div className="bg-[#2a2a2d] rounded-2xl p-6 border border-[#333] mb-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" style={{ backgroundColor: getPartyColor(selectedAnalysisParty) }}></div>
        <h3 className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-5">สรุปผลงานพรรค</h3>
        
        <div className="flex items-center space-x-5 mb-6">
           <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 shadow-inner">
              <TrendingUp size={28} style={{ color: getPartyColor(selectedAnalysisParty) }} />
           </div>
           <div>
              <p className="text-3xl font-black text-white leading-none mb-1">{partyStats.totalVotes.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Total Party-List Votes</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
           <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center space-x-2 mb-1">
                 <Trophy size={16} className="text-yellow-500" />
                 <span className="text-[10px] text-gray-400 font-bold">ชนะเลือกตั้ง</span>
              </div>
              <p className="text-2xl font-black text-white">{partyStats.wins} <span className="text-xs font-normal text-gray-500">เขต</span></p>
           </div>
           <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="flex items-center space-x-2 mb-1">
                 <Users size={16} className="text-blue-500" />
                 <span className="text-[10px] text-gray-400 font-bold">อันดับเฉลี่ย</span>
              </div>
              <p className="text-2xl font-black text-white">
                {(analysisData.reduce((sum, d) => sum + d.rank, 0) / analysisData.length).toFixed(1)}
              </p>
           </div>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-5 flex items-center">
          <span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: getPartyColor(selectedAnalysisParty) }}></span>
          Top 5 Close Fight Districts
        </h4>
        <div className="space-y-4">
          {partyStats.topCloseFights.map((d, i) => (
            <div key={i} className="bg-[#1e1e20] rounded-2xl p-5 border border-[#333] hover:border-orange-500/30 hover:bg-[#252528] transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">{d.province}</p>
                  <p className="text-base font-black text-gray-200 group-hover:text-white transition-colors">เขตเลือกตั้งที่ {d.district}</p>
                </div>
                <div className="text-right">
                   <div className="px-2 py-1 rounded bg-red-500/10 border border-red-500/20 mb-1">
                      <p className="text-sm font-black text-red-500 leading-none">-{ (d.margin * 100).toFixed(1) }%</p>
                   </div>
                      <p className="text-[9px] text-gray-500 uppercase font-black">Gap to winner</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 relative z-10">
                <span className="text-xs text-gray-400 font-bold">ได้ { d.partyVotes.toLocaleString() } คะแนน</span>
                <span className="flex items-center text-xs text-yellow-500 font-black">
                   อันดับที่ { d.rank } <ChevronRight size={12} className="ml-1" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
