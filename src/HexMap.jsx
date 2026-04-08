import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { PROVINCE_GRID } from './grid_config';

const HexMap = ({ data, colors, searchQuery, selectedProvince, selectedParty, hoveredProvince, selectedRegion, regionMap, selectedKeyArea, onTileClick, onProvinceHover, analysisMode, selectedAnalysisParty, analysisData }) => {
   const svgRef = useRef(null);
   const containerRef = useRef(null);
   const zoomRef = useRef(null);
   const initialTransformRef = useRef(null);
   const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, data: null });

   useEffect(() => {
      if (!data || data.length === 0 || !svgRef.current) return;

      d3.select(svgRef.current).selectAll("*").remove();

      const parent = containerRef.current;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      const svg = d3.select(svgRef.current)
         .attr("width", width)
         .attr("height", height)
         .style("background-color", "transparent");

      // Scale up individual hexagons by 1.5x
      const hexScale = 1.5;

      // Hexagon Constants (scaled up 1.5x)
      const hexRadius = 16 * hexScale; // 24
      const hexWidth = Math.sqrt(3) * hexRadius;
      const hexHeight = 2 * hexRadius;
      const vertDist = (3 / 4) * hexHeight;
      const horizDist = hexWidth;

      const titleSpace = 28 * hexScale;
      const containerPadding = 10 * hexScale;

      const provinceDataMap = d3.group(data, d => d['จังหวัด']);

      // Tight spacing — just enough to separate province boxes
      const cellSpacingX = 140;
      const cellSpacingY = 130;

      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;

      const containers = [];
      const tileConfigs = []; // store configs, resolve positions later

      // Phase 1: compute container sizes and initial positions
      Array.from(provinceDataMap.entries()).forEach(([province, constituents]) => {
         const gridPos = PROVINCE_GRID[province] || { x: 5, y: 15 };

         const totalSeats = constituents.length;
         const cols = province === 'กรุงเทพมหานคร' ? 11 : Math.ceil(Math.sqrt(totalSeats));
         const rows = Math.ceil(totalSeats / cols);

         const internalWidth = (cols * horizDist) + (hexWidth / 2);
         const internalHeight = (rows * vertDist) + (hexHeight / 4);

         const containerWidth = internalWidth + (containerPadding * 2);
         const containerHeight = internalHeight + (containerPadding * 2) + titleSpace;

         const globalX = gridPos.x * cellSpacingX;
         const globalY = gridPos.y * cellSpacingY;

         containers.push({
            province,
            globalX,
            globalY,
            width: containerWidth,
            height: containerHeight,
            totalSeats,
            cols,
            constituents
         });
      });

      // Phase 2: Iterative collision resolution — push overlapping boxes apart
      const gap = 8; // minimum pixel gap between province boxes
      for (let iter = 0; iter < 30; iter++) {
         let moved = false;
         for (let i = 0; i < containers.length; i++) {
            for (let j = i + 1; j < containers.length; j++) {
               const a = containers[i];
               const b = containers[j];

               const overlapX = (a.globalX + a.width + gap) - b.globalX;
               const overlapY = (a.globalY + a.height + gap) - b.globalY;
               const overlapXr = (b.globalX + b.width + gap) - a.globalX;
               const overlapYr = (b.globalY + b.height + gap) - a.globalY;

               // Check if they actually overlap (both axes)
               const hOverlap = a.globalX < b.globalX + b.width + gap && b.globalX < a.globalX + a.width + gap;
               const vOverlap = a.globalY < b.globalY + b.height + gap && b.globalY < a.globalY + a.height + gap;

               if (hOverlap && vOverlap) {
                  // Find smallest push direction
                  const pushRight = (a.globalX + a.width + gap) - b.globalX;
                  const pushLeft = (b.globalX + b.width + gap) - a.globalX;
                  const pushDown = (a.globalY + a.height + gap) - b.globalY;
                  const pushUp = (b.globalY + b.height + gap) - a.globalY;

                  const minPush = Math.min(
                     Math.abs(pushRight), Math.abs(pushLeft),
                     Math.abs(pushDown), Math.abs(pushUp)
                  );

                  if (minPush === Math.abs(pushRight)) {
                     b.globalX += pushRight / 2 + 1;
                     a.globalX -= pushRight / 2 + 1;
                  } else if (minPush === Math.abs(pushLeft)) {
                     a.globalX += pushLeft / 2 + 1;
                     b.globalX -= pushLeft / 2 + 1;
                  } else if (minPush === Math.abs(pushDown)) {
                     b.globalY += pushDown / 2 + 1;
                     a.globalY -= pushDown / 2 + 1;
                  } else {
                     a.globalY += pushUp / 2 + 1;
                     b.globalY -= pushUp / 2 + 1;
                  }
                  moved = true;
               }
            }
         }
         if (!moved) break;
      }

      // Phase 3: Generate tile positions from resolved container positions
      const tiles = [];
      containers.forEach(c => {
         if (c.globalX < minX) minX = c.globalX;
         if (c.globalX + c.width > maxX) maxX = c.globalX + c.width;
         if (c.globalY < minY) minY = c.globalY;
         if (c.globalY + c.height > maxY) maxY = c.globalY + c.height;

         c.constituents.forEach((d, i) => {
            const row = Math.floor(i / c.cols);
            const col = i % c.cols;

            const offset = row % 2 !== 0 ? horizDist / 2 : 0;

            const localX = containerPadding + col * horizDist + offset + (hexWidth / 2);
            const localY = titleSpace + containerPadding + row * vertDist + (hexHeight / 2);

            const matchNum = d['เขต'] ? d['เขต'].toString().match(/\d+/) : null;
            const displayNum = matchNum ? matchNum[0] : (i + 1);

            tiles.push({
               ...d,
               province: c.province,
               displayNum,
               cx: c.globalX + localX,
               cy: c.globalY + localY,
               partyColor: colors[d['พรรค']] || '#999'
            });
         });
      });

      const g = svg.append("g");

      const zoom = d3.zoom()
         .scaleExtent([0.1, 8])
         .on("zoom", (event) => {
            g.attr("transform", event.transform);
         });
      svg.call(zoom);
      zoomRef.current = zoom;

      // Auto-fit map to fill the screen exactly
      const mapWidth = maxX - minX;
      const mapHeight = maxY - minY;
      let initialScale = Math.min(width / mapWidth, height / mapHeight) * 0.9;

      let translateX = width / 2 - (minX + mapWidth / 2) * initialScale;
      let translateY = height / 2 - (minY + mapHeight / 2) * initialScale;

      if (selectedProvince) {
         const targetProv = containers.find(c => c.province === selectedProvince);
         if (targetProv) {
            const provScaleX = width / targetProv.width;
            const provScaleY = height / targetProv.height;
            initialScale = Math.min(Math.min(provScaleX, provScaleY) * 0.7, 4);
            translateX = width / 2 - (targetProv.globalX + targetProv.width / 2) * initialScale;
            translateY = height / 2 - (targetProv.globalY + targetProv.height / 2) * initialScale;
         }
      } else if (selectedRegion && selectedRegion !== 'ทั่วประเทศ' && regionMap) {
         const regionProvs = containers.filter(c => regionMap[c.province] === selectedRegion);
         if (regionProvs.length > 0) {
            const rMinX = d3.min(regionProvs, c => c.globalX);
            const rMaxX = d3.max(regionProvs, c => c.globalX + c.width);
            const rMinY = d3.min(regionProvs, c => c.globalY);
            const rMaxY = d3.max(regionProvs, c => c.globalY + c.height);

            const rWidth = rMaxX - rMinX;
            const rHeight = rMaxY - rMinY;

            const rScaleX = width / rWidth;
            const rScaleY = height / rHeight;
            initialScale = Math.min(Math.min(rScaleX, rScaleY) * 0.7, 3);

            translateX = width / 2 - (rMinX + rWidth / 2) * initialScale;
            translateY = height / 2 - (rMinY + rHeight / 2) * initialScale;
         }
      }

      const initialT = d3.zoomIdentity
         .translate(translateX, translateY)
         .scale(initialScale);

      svg.call(zoom.transform, initialT);
      initialTransformRef.current = initialT;

      const provGroups = g.selectAll(".province-container")
         .data(containers)
         .enter()
         .append("g")
         .attr("class", "province-container")
         .attr("transform", d => `translate(${d.globalX}, ${d.globalY})`)
         .style("cursor", "pointer")
         .style("opacity", d => {
            if (selectedProvince && selectedProvince !== d.province) return 0.05;
            if (!selectedProvince && selectedRegion && selectedRegion !== 'ทั่วประเทศ' && regionMap && regionMap[d.province] !== selectedRegion) return 0.05;
            return 1;
         })
         .style("pointer-events", d => {
            if (selectedProvince && selectedProvince !== d.province) return "none";
            if (!selectedProvince && selectedRegion && selectedRegion !== 'ทั่วประเทศ' && regionMap && regionMap[d.province] !== selectedRegion) return "none";
            return "auto";
         })
         .on("mouseenter", function (event, d) {
            if (onProvinceHover) onProvinceHover(d.province);
            // Highlight this province container
            d3.select(this).select("rect")
               .attr("stroke", "#f97316")
               .attr("stroke-width", 2);
         })
         .on("mouseleave", function (event, d) {
            if (onProvinceHover) onProvinceHover(null);
            d3.select(this).select("rect")
               .attr("stroke", "#444")
               .attr("stroke-width", 1);
         });

      provGroups.append("rect")
         .attr("width", d => d.width)
         .attr("height", d => d.height)
         .attr("rx", 8)
         .attr("fill", d => {
            if (selectedProvince === d.province || hoveredProvince === d.province) return "rgba(249, 115, 22, 0.08)";
            if (searchQuery && d.province.includes(searchQuery)) return "rgba(249, 115, 22, 0.06)";
            return "rgba(255, 255, 255, 0.02)";
         })
         .attr("stroke", d => {
            if (selectedProvince === d.province) return "#f97316";
            if (hoveredProvince === d.province) return "#f97316";
            if (searchQuery && d.province.includes(searchQuery)) return "#f9731680";
            return "#444";
         })
         .attr("stroke-width", d => {
            if (selectedProvince === d.province || hoveredProvince === d.province) return 2;
            return 1;
         });

      provGroups.append("text")
         .attr("x", d => d.width / 2)
         .attr("y", 22 * hexScale)
         .text(d => d.province)
         .attr("text-anchor", "middle")
         .attr("fill", d => {
            if (selectedProvince === d.province || hoveredProvince === d.province) return "#f97316";
            if (searchQuery && d.province.includes(searchQuery)) return "#fbbf24";
            return "white";
         })
         .attr("font-size", `${14 * hexScale}px`)
         .attr("font-weight", "600")
         .attr("font-family", "Inter")
         .style("text-shadow", "0px 1px 3px rgba(0,0,0,0.8)");

      const hexPath = (r) => {
         let path = "";
         for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - (Math.PI / 6);
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            if (i === 0) path += `M${x},${y}`;
            else path += `L${x},${y}`;
         }
         path += "Z";
         return path;
      };

      const tileGroups = g.selectAll(".seat-tile")
         .data(tiles)
         .enter()
         .append("g")
         .attr("class", "seat-tile")
         .attr("transform", d => `translate(${d.cx}, ${d.cy})`)
         .style("cursor", "pointer")
         .style("opacity", d => {
            if (analysisMode && selectedAnalysisParty && analysisData) {
               const ad = analysisData.find(a => a.province === d.province && String(a.district) === String(d.displayNum));
               if (ad) {
                  if (ad.isWinner) return 1;
                  if (ad.margin < 0.05) return 0.9;
                  if (ad.margin < 0.15) return 0.6;
                  return 0.2;
               }
            }
            if (selectedProvince && selectedProvince !== d.province) return 0.05;
            if (!selectedProvince && selectedRegion && selectedRegion !== 'ทั่วประเทศ' && regionMap && regionMap[d.province] !== selectedRegion) return 0.05;

            if (selectedKeyArea) {
               const winnerVotes = parseInt(d['คะแนน']) || 0;
               const totalValid = parseInt(d['คะแนนดี']) || 0;
               const margin = totalValid > 0 ? (winnerVotes / totalValid) * 100 : 0;
               if (selectedKeyArea === 'hot' && margin >= 40) return 0.15;
               if (selectedKeyArea === 'landslide' && margin < 55) return 0.15;
            }

            // Dim tiles that don't match the selected party filter
            if (selectedParty && d.province !== undefined) {
               const party = d['พรรค'];
               if (party !== selectedParty) return 0.15;
            }
            return 1;
         })
         .style("pointer-events", d => {
            if (selectedProvince && selectedProvince !== d.province) return "none";
            if (!selectedProvince && selectedRegion && selectedRegion !== 'ทั่วประเทศ' && regionMap && regionMap[d.province] !== selectedRegion) return "none";
            return "auto";
         })
         .on("mouseover", function (event, d) {
            d3.select(this).raise();  // Fix text getting hidden behind path by raising the group
            d3.select(this).select("path")
               .attr("stroke", "#fff")
               .attr("stroke-width", 2.5)
               .style("filter", d => {
                  if (analysisMode && selectedAnalysisParty && analysisData) {
                     const ad = analysisData.find(a => a.province === d.province && String(a.district) === String(d.displayNum));
                     if (ad?.isWinner) return "drop-shadow(0 0 5px white)";
                  }
                  return null;
               });

            // Highlight all tiles in same province
            if (onProvinceHover) onProvinceHover(d.province);

            setTooltip({
               visible: true,
               x: event.pageX,
               y: event.pageY,
               data: d
            });
         })
         .on("mousemove", function (event) {
            setTooltip(prev => ({ ...prev, x: event.pageX, y: event.pageY }));
         })
         .on("mouseout", function (event, d) {
            d3.select(this).select("path")
               .attr("stroke", d => {
                  if (analysisMode && selectedAnalysisParty && analysisData) {
                     const ad = analysisData.find(a => a.province === d.province && String(a.district) === String(d.displayNum));
                     if (ad?.isWinner) return "white";
                  }
                  return "rgba(0,0,0,0.3)";
               })
               .attr("stroke-width", d => {
                  if (analysisMode && selectedAnalysisParty && analysisData) {
                     const ad = analysisData.find(a => a.province === d.province && String(a.district) === String(d.displayNum));
                     if (ad?.isWinner) return 2;
                  }
                  return 1;
               })
               .style("filter", d => {
                  if (analysisMode && selectedAnalysisParty && analysisData) {
                     const ad = analysisData.find(a => a.province === d.province && String(a.district) === String(d.displayNum));
                     if (ad?.isWinner) return "drop-shadow(0 0 3px white)";
                  }
                  return null;
               });
            if (onProvinceHover) onProvinceHover(null);
            setTooltip(prev => ({ ...prev, visible: false }));
         })
         .on("click", function (event, d) {
            if (onTileClick) onTileClick(d.province, d.displayNum);
         });

      tileGroups.append("path")
         .attr("d", hexPath(hexRadius))
         .attr("fill", d => {
            if (analysisMode && selectedAnalysisParty) return colors[selectedAnalysisParty] || '#999';
            return d.partyColor;
         })
         .attr("stroke", d => {
            if (analysisMode && selectedAnalysisParty && analysisData) {
               const ad = analysisData.find(a => a.province === d.province && String(a.district) === String(d.displayNum));
               if (ad?.isWinner) return "white";
            }
            return "rgba(0,0,0,0.3)";
         })
         .attr("stroke-width", d => {
            if (analysisMode && selectedAnalysisParty && analysisData) {
               const ad = analysisData.find(a => a.province === d.province && String(a.district) === String(d.displayNum));
               if (ad?.isWinner) return 2;
            }
            return 1;
         })
         .style("filter", d => {
            if (analysisMode && selectedAnalysisParty && analysisData) {
               const ad = analysisData.find(a => a.province === d.province && String(a.district) === String(d.displayNum));
               if (ad?.isWinner) return "drop-shadow(0 0 3px white)";
            }
            return null;
         });

      tileGroups.append("text")
         .attr("x", 0)
         .attr("y", 0)
         .attr("text-anchor", "middle")
         .attr("alignment-baseline", "central")
         .attr("dy", "1px")
         .text(d => d.displayNum)
         .attr("fill", "white")
         .attr("font-size", `${hexRadius * 0.75}px`) // text proportional to hexagon scale 
         .attr("font-weight", "bold")
         .attr("font-family", "Inter")
         .style("pointer-events", "none")
         .style("text-shadow", "0px 1px 2px rgba(0,0,0,0.6)");
   }, [data, colors, searchQuery, selectedProvince, selectedParty, hoveredProvince, selectedRegion, regionMap, selectedKeyArea, analysisMode, selectedAnalysisParty, analysisData]);

   return (
      <div ref={containerRef} className="w-full h-full relative" style={{ backgroundImage: 'linear-gradient(#ffffff0a 1px, transparent 1px), linear-gradient(90deg, #ffffff0a 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
         {/* touch-none prevents native scroll so D3 pinch-to-zoom / pan works */}
         <svg ref={svgRef} className="w-full h-full" style={{ touchAction: 'none' }}></svg>

         {/* Controls: top-left on desktop, bottom-right on mobile (above bottom sheet) */}
         <div className="absolute top-6 left-6 md:top-6 md:left-6 max-md:top-auto max-md:bottom-24 max-md:left-auto max-md:right-4 flex flex-col bg-[#222225]/90 backdrop-blur-md rounded-xl border border-[#333] shadow-2xl z-40 overflow-hidden select-none">
            <button
               onClick={() => zoomRef.current && d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.scaleBy, 1.4)}
               className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all rounded-t-xl touch-manipulation" title="Zoom In">
               <Plus size={18} />
            </button>
            <div className="h-px bg-[#333] mx-2"></div>
            <button
               onClick={() => zoomRef.current && initialTransformRef.current && d3.select(svgRef.current).transition().duration(800).ease(d3.easeCubicInOut).call(zoomRef.current.transform, initialTransformRef.current)}
               className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all touch-manipulation" title="Reset Map">
               <RotateCcw size={16} />
            </button>
            <div className="h-px bg-[#333] mx-2"></div>
            <button
               onClick={() => zoomRef.current && d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.scaleBy, 0.7)}
               className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all rounded-b-xl touch-manipulation" title="Zoom Out">
               <Minus size={18} />
            </button>
         </div>

         {tooltip.visible && tooltip.data && (
            <div
               className="fixed bg-[#222225] border border-[#444] text-white p-3 rounded-xl shadow-2xl z-50 pointer-events-none transform -translate-x-1/2 -translate-y-[120%]"
               style={{ left: tooltip.x, top: tooltip.y, minWidth: '180px' }}
            >
               <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{tooltip.data['จังหวัด']} • เขต {tooltip.data['เขต']}</div>
               <div className="text-base font-bold mb-1">{tooltip.data['ผู้ชนะ']}</div>
               <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tooltip.data.partyColor }}></div>
                  <div className="text-sm font-medium" style={{ color: tooltip.data.partyColor }}>{tooltip.data['พรรค']}</div>
               </div>
               <div className="bg-[#111] -mx-3 -mb-3 p-2.5 rounded-b-xl border-t border-[#333]">
                  {analysisMode && selectedAnalysisParty && analysisData ? (
                     (() => {
                        const ad = analysisData.find(a => a.province === tooltip.data.province && String(a.district) === String(tooltip.data.displayNum));
                        if (!ad) return null;
                        const gap = ad.winnerVotes - ad.partyVotes;
                        return (
                           <div className="space-y-1">
                              <div className="flex justify-between items-center text-xs text-gray-300">
                                 <span>{selectedAnalysisParty}</span>
                                 <span className="font-bold text-yellow-500">อันดับที่ {ad.rank}</span>
                              </div>
                              {!ad.isWinner && (
                                 <div className="flex justify-between items-center text-xs text-gray-300">
                                    <span>ตามหลังผู้ชนะ:</span>
                                    <span className="font-bold text-red-400">{gap.toLocaleString()} คะแนน</span>
                                 </div>
                              )}
                              {ad.isWinner && (
                                 <div className="flex justify-between items-center text-xs text-gray-300">
                                    <span className="text-green-400 font-bold italic">ชนะการเลือกตั้งในเขตนี้</span>
                                 </div>
                              )}
                           </div>
                        );
                     })()
                  ) : (
                     <>
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                           <span>Winner Votes:</span>
                           <span className="font-bold text-green-400">{parseInt(tooltip.data['คะแนน'] || 0).toLocaleString()}</span>
                        </div>
                        {tooltip.data['ผู้มีสิทธิ'] && (
                           <div className="flex justify-between items-center text-xs text-gray-400">
                              <span>Turnout:</span>
                              <span className="font-bold text-blue-400">
                                 {((parseInt(tooltip.data['มาใช้สิทธิ'] || 0) / parseInt(tooltip.data['ผู้มีสิทธิ'] || 1)) * 100).toFixed(1)}%
                              </span>
                           </div>
                        )}
                     </>
                  )}
               </div>

               <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full border-solid border-t-8 border-t-[#444] border-l-8 border-l-transparent border-r-8 border-r-transparent"></div>
               <div className="absolute left-1/2 bottom-[1px] transform -translate-x-1/2 translate-y-full border-solid border-t-8 border-t-[#222225] border-l-8 border-l-transparent border-r-8 border-r-transparent z-10"></div>
            </div>
         )}
      </div>
   );
};

export default HexMap;
