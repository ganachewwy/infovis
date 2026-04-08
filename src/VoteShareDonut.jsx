import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';

export default function VoteShareDonut({ candidates, totalValid, getPartyColor }) {
  const [hoveredCandidate, setHoveredCandidate] = useState(null);

  const { data, othersCount, othersVotes } = useMemo(() => {
    let processedData = [];
    let othersV = 0;
    let othersC = 0;

    candidates.forEach((c, idx) => {
      const votes = parseInt(c['คะแนน']) || 0;
      if (votes === 0) return;

      const pct = (votes / totalValid) * 100;
      
      // Keep top candidates or anyone with > 1.5% vote share
      if (idx < 6 || pct > 1.5) {
        processedData.push({
          id: c['ชื่อผู้สมัคร'],
          party: c['พรรค'],
          votes: votes,
          pct: pct
        });
      } else {
        othersV += votes;
        othersC += 1;
      }
    });

    if (othersC > 0) {
      processedData.push({
        id: `Others (${othersC})`,
        party: 'Others',
        votes: othersV,
        pct: (othersV / totalValid) * 100,
        isOthers: true
      });
    }

    return { data: processedData, othersCount: othersC, othersVotes: othersV };
  }, [candidates, totalValid]);

  const width = 240;
  const height = 240;
  const margin = 10;
  const radius = Math.min(width, height) / 2 - margin;
  const innerRadius = radius * 0.65; // Make it a donut

  const pie = useMemo(() => {
    return d3.pie()
      .value(d => d.votes)
      .sort(null) // data is already sorted
      .padAngle(0.02);
  }, []);

  const arcs = useMemo(() => {
    return pie(data);
  }, [pie, data]);

  const arcGenerator = useMemo(() => {
    return d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4);
  }, [innerRadius, radius]);

  const arcHoverGenerator = useMemo(() => {
    return d3.arc()
      .innerRadius(innerRadius - 2)
      .outerRadius(radius + 8)
      .cornerRadius(6);
  }, [innerRadius, radius]);

  if (!data || data.length === 0) return null;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-[240px] h-[240px]">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <g transform={`translate(${width / 2},${height / 2})`}>
            {arcs.map((arc, i) => {
              const d = arc.data;
              const isHovered = hoveredCandidate === d.id;
              
              let fill;
              if (d.isOthers) {
                fill = '#333333';
              } else {
                fill = getPartyColor(d.party);
              }

              return (
                <path
                  key={d.id}
                  d={isHovered ? arcHoverGenerator(arc) : arcGenerator(arc)}
                  fill={fill}
                  className="transition-all duration-300 ease-out cursor-pointer"
                  style={{ 
                    filter: isHovered ? `drop-shadow(0 0 8px ${fill}80)` : 'none',
                  }}
                  onMouseEnter={() => setHoveredCandidate(d.id)}
                  onMouseLeave={() => setHoveredCandidate(null)}
                />
              );
            })}
          </g>
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredCandidate ? (
            <div className="text-center px-4 animate-in fade-in duration-200">
              {(() => {
                const hoveredData = data.find(d => d.id === hoveredCandidate);
                if (!hoveredData) return null;
                return (
                  <>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 line-clamp-1">{hoveredData.party}</p>
                    <p className="text-2xl font-black text-white leading-none mb-1" style={{ color: hoveredData.isOthers ? '#888' : getPartyColor(hoveredData.party) }}>
                      {hoveredData.pct.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-300 font-medium">{hoveredData.votes.toLocaleString()}</p>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-center animate-in fade-in duration-200">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Valid</p>
              <p className="text-2xl font-black text-white leading-none mb-1">{totalValid.toLocaleString()}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Votes</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Legend for Donut Chart - limit to top 4 for space */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full px-2">
        {data.slice(0, 4).map((d) => (
          <div 
            key={d.id} 
            className="flex items-center space-x-2 cursor-pointer group"
            onMouseEnter={() => setHoveredCandidate(d.id)}
            onMouseLeave={() => setHoveredCandidate(null)}
          >
            <div 
              className={`w-3 h-3 rounded-sm transition-transform ${hoveredCandidate === d.id ? 'scale-125' : ''}`} 
              style={{ backgroundColor: d.isOthers ? '#555' : getPartyColor(d.party) }}
            ></div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-bold truncate transition-colors ${hoveredCandidate === d.id ? 'text-white' : 'text-gray-300'}`}>
                {d.isOthers ? 'Others' : d.party}
              </p>
            </div>
            <div className="text-[10px] font-black text-gray-400 text-right">
              {d.pct.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
