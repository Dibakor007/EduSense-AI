import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import * as d3 from 'd3';
import 'd3-transition';
import { User, GraphNode, KnowledgeGraphData } from '../types';
import Card from './Card';
import Button from './Button';
import { Share2Icon, LightbulbIcon, TrendingUpIcon, TrendingDownIcon, SparklesIcon, XCircleIcon } from './icons';
import ProgressBar from './ProgressBar';

interface KnowledgeGraphViewProps {
  userRole: User['role'];
  graphData: KnowledgeGraphData;
}

const NODE_RADIUS = 35;

const Tooltip: React.FC<{ node: (GraphNode & d3.SimulationNodeDatum) | null, position: { x: number, y: number }, color: string }> = ({ node, position, color }) => {
    if (!node) return null;
  
    return (
      <div
        className="absolute p-3 bg-surface/80 backdrop-blur-xl rounded-xl shadow-lg border-white/20 pointer-events-none transition-opacity duration-200"
        style={{ left: position.x, top: position.y, transform: 'translate(15px, 15px)', minWidth: '220px' }}
      >
        <h4 className="font-bold text-neutral-extradark" style={{ color }}>{node.label}</h4>
        <div className="flex items-center my-1">
          {/* Fix: Use the `barStyle` prop to dynamically color the progress bar instead of passing children. */}
          <ProgressBar value={node.mastery} max={100} className="!h-2" barStyle={{ backgroundColor: color }} />
          <span className="ml-2 text-sm font-bold text-neutral-dark">{node.mastery}%</span>
        </div>
        <p className="text-xs text-neutral-medium">{node.description}</p>
      </div>
    );
};

const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ userRole, graphData }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  
  const isTeacherView = userRole === 'teacher';
  const data = graphData;
  
  const [hoveredNode, setHoveredNode] = useState<(GraphNode & d3.SimulationNodeDatum) | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isSuggestionLoading, setIsSuggestionLoading] = useState<boolean>(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);


  const { groups, colorScale } = useMemo(() => {
    const uniqueGroups = [...new Set(data.nodes.filter(n => n.group).map(n => n.group!))];
    const themeColors = ['#4F46E5', '#06B6D4', '#10B6D4', '#F59E0B', '#EF4444', '#8B5CF6'];
    const scale = d3.scaleOrdinal(themeColors).domain(uniqueGroups);
    return { groups: uniqueGroups, colorScale: scale };
  }, [data]);
  
  const handleGetSuggestion = async () => {
    if (!selectedNode) return;
    setIsSuggestionLoading(true);
    setAiSuggestion('');
    setSuggestionError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `I am a student with a ${selectedNode.mastery}% mastery in the topic "${selectedNode.label}". Provide me with a short, actionable tip (2-3 sentences) on how to improve. Focus on a specific concept or practice method.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });
      setAiSuggestion(response.text);

    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      setSuggestionError("Sorry, I couldn't get a suggestion right now. Please try again.");
    } finally {
      setIsSuggestionLoading(false);
    }
  };
  
  const handleBackToOverview = () => {
      setSelectedNode(null);
      setAiSuggestion('');
      setSuggestionError(null);
      if (svgRef.current) {
          d3.select(svgRef.current).selectAll('.selection-ring').attr('opacity', 0);
      }
  };

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 600;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    svg.attr('viewBox', `0 0 ${width} ${height}`).style('cursor', 'grab');

    const defs = svg.append('defs');
    defs.append('pattern')
        .attr('id', 'grid')
        .attr('width', 40)
        .attr('height', 40)
        .attr('patternUnits', 'userSpaceOnUse')
      .append('path')
        .attr('d', 'M 0 40 L 40 40 40 0')
        .attr('fill', 'none')
        .attr('stroke', '#eef2ff')
        .attr('stroke-width', 1);

    defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
      .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#94A3B8');

    svg.append('rect').attr('width', '100%').attr('height', '100%').attr('fill', 'url(#grid)');

    const container = svg.append("g");
    
    const nodes = data.nodes.map(d => ({...d}));
    const links = data.edges.map(d => ({...d}));
    
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(180))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(NODE_RADIUS + 15));

    const link = container.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke", "#94A3B8")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 2)
        .attr('marker-end', 'url(#arrowhead)');

    const node = container.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
        .attr("class", "cursor-pointer")
        .call(createDragBehavior(simulation) as any);
        
    const circumference = (NODE_RADIUS - 4) * 2 * Math.PI;

    node.append("circle").attr('class', 'selection-ring')
        .attr("r", NODE_RADIUS + 6)
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d.group!))
        .attr("stroke-width", 4)
        .attr("stroke-opacity", 0.5)
        .attr('opacity', 0);

    node.append("circle").attr("r", NODE_RADIUS - 4).attr("fill", "white").attr("stroke", "#e5e7eb").attr("stroke-width", 8);

    node.append("circle").attr("r", NODE_RADIUS - 4).attr("fill", "transparent")
        .attr("stroke", d => d.group ? colorScale(d.group) : '#ccc')
        .attr("stroke-width", 8)
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", circumference)
        .attr("stroke-dashoffset", d => circumference - (d.mastery / 100) * circumference)
        .style("transform-origin", "center").style("transform", "rotate(-90deg)");

    node.append("circle").attr("r", NODE_RADIUS - 8).attr("fill", d => d3.color(colorScale(d.group!))?.brighter(1.2).toString() || '#eee');

    const indicator = node.filter(d => d.previousMastery !== undefined);
    indicator.filter(d => d.mastery > d.previousMastery!)
      .append('path').attr('d', 'M0,-4 L4,4 L-4,4 Z').attr('fill', '#10b981').attr('transform', `translate(${NODE_RADIUS - 16}, -${NODE_RADIUS - 16}) scale(0.9)`);
    indicator.filter(d => d.mastery < d.previousMastery!)
      .append('path').attr('d', 'M0,4 L4,-4 L-4,-4 Z').attr('fill', '#ef4444').attr('transform', `translate(${NODE_RADIUS - 16}, -${NODE_RADIUS - 16}) scale(0.9)`);

    node.filter(d => !!d.suggestion)
        .append("circle").attr("stroke", "#FBBF24").attr("stroke-width", 3).attr("fill", "none").attr("r", NODE_RADIUS + 4)
        .style("animation", "pulse 2s infinite");

    node.append("text").attr("text-anchor", "middle").attr("dy", "0.3em")
        .text(d => `${d.mastery}%`).attr("fill", d => d3.color(colorScale(d.group!))?.darker(1.5).toString() || '#333')
        .attr("font-weight", "bold").style("font-size", "14px").style("pointer-events", "none");

    node.append("text").attr("text-anchor", "middle").attr("dy", NODE_RADIUS + 16)
        .text(d => d.label).attr("fill", "#334155").style("font-size", "12px").style("font-weight", "600").style("pointer-events", "none");

    const linkedByIndex = new Map();
    links.forEach(d => { linkedByIndex.set(`${d.source},${d.target}`, true); });
    function areNodesConnected(a: any, b: any) { return linkedByIndex.has(`${a.id},${b.id}`) || linkedByIndex.has(`${b.id},${a.id}`) || a.id === b.id; }

    node.on("mouseover", (event, d) => {
        setHoveredNode(d as any);
        const [x, y] = d3.pointer(event, document.body);
        setTooltipPosition({x, y});
        node.style('opacity', o => areNodesConnected(d, o) ? 1 : 0.2);
        link.style('opacity', l => (l.source as any).id === d.id || (l.target as any).id === d.id ? 1 : 0.2);
    })
    .on("mouseout", () => {
        setHoveredNode(null);
        node.style('opacity', 1);
        link.style('opacity', 0.6);
    })
    .on("mousemove", (event) => {
        const [x, y] = d3.pointer(event, document.body);
        setTooltipPosition({x, y});
    })
    .on("click", function(event, d) {
        event.stopPropagation();
        setSelectedNode(d);
        setAiSuggestion('');
        setSuggestionError(null);
        node.selectAll('.selection-ring').attr('opacity', 0);
        d3.select(this).select('.selection-ring').attr('opacity', 1);
    });

    simulation.on("tick", () => {
      link.each(function(d: any) {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return;
        const targetRadius = NODE_RADIUS + 2; // + stroke width
        const targetX = d.target.x - (dx / distance) * targetRadius;
        const targetY = d.target.y - (dy / distance) * targetRadius;
        d3.select(this).attr("x1", d.source.x).attr("y1", d.source.y).attr("x2", targetX).attr("y2", targetY);
      });
      node.attr("transform", d => `translate(${(d as d3.SimulationNodeDatum).x}, ${(d as d3.SimulationNodeDatum).y})`);
    });

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>().scaleExtent([0.3, 3]).on("zoom", (event) => { container.attr("transform", event.transform); });
    svg.call(zoomBehavior);
    zoomRef.current = zoomBehavior;

    return () => { simulation.stop(); };
  }, [data, colorScale]);

  function createDragBehavior(simulation: d3.Simulation<d3.SimulationNodeDatum, undefined>) {
    function dragstarted(event: any, d: any) { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; }
    function dragged(event: any, d: any) { d.fx = event.x; d.fy = d.y; }
    function dragended(event: any, d: any) { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; }
    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
  }

  const handleZoom = (direction: 'in' | 'out') => {
    if (!svgRef.current || !zoomRef.current) return;
    const zoomBehavior = zoomRef.current;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehavior.scaleBy, direction === 'in' ? 1.2 : 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    const zoomBehavior = zoomRef.current;
    d3.select(svgRef.current).transition().duration(500).call(zoomBehavior.transform, d3.zoomIdentity);
  };
  
  const aiSummaryTitle = isTeacherView ? "Class Learning Pattern Summary" : "My Learning Pattern Summary";
  const aiSummaryText = isTeacherView
    ? "The class shows strong fundamentals in Data Structures, especially Arrays. However, there's a significant, common difficulty with abstract concepts like Algorithms and Time Complexity. These areas should be a focus for upcoming lessons and review sessions."
    : "You have a strong foundation in core Data Structures like Arrays and Stacks. Your main growth opportunity is in understanding algorithmic efficiency, specifically Time Complexity. Focusing here will significantly boost your overall computer science knowledge.";

  const renderSidebarContent = () => {
      if (selectedNode) {
          return (
             <Card className="flex flex-col h-full animate-fade-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-neutral-dark text-xl font-display">Skill Details</h3>
                    <button onClick={handleBackToOverview} className="text-neutral-medium hover:text-neutral-dark p-1 rounded-full"><XCircleIcon className="w-6 h-6"/></button>
                </div>
                <h4 className="font-bold text-2xl" style={{ color: colorScale(selectedNode.group!) }}>{selectedNode.label}</h4>
                <div className="my-3">
                    <div className="flex justify-between items-center text-sm font-semibold mb-1">
                        <span>Mastery Level</span>
                        <span style={{ color: colorScale(selectedNode.group!) }}>{selectedNode.mastery}%</span>
                    </div>
                    {/* Fix: Use the `barStyle` prop to dynamically color the progress bar instead of passing children. */}
                    <ProgressBar value={selectedNode.mastery} max={100} className="!h-3" barStyle={{ backgroundColor: colorScale(selectedNode.group!) }} />
                </div>
                {selectedNode.previousMastery !== undefined && (
                    <div className={`flex items-center text-sm font-semibold p-2 rounded-lg mb-3 ${selectedNode.mastery > selectedNode.previousMastery ? 'bg-success/10 text-success-dark' : 'bg-danger/10 text-danger-dark'}`}>
                         {selectedNode.mastery > selectedNode.previousMastery ? <TrendingUpIcon className="w-5 h-5 mr-2"/> : <TrendingDownIcon className="w-5 h-5 mr-2"/>}
                         <span>
                            {selectedNode.mastery > selectedNode.previousMastery ? 'Increased' : 'Decreased'} from {selectedNode.previousMastery}%
                         </span>
                    </div>
                )}
                <p className="text-neutral-dark text-sm leading-relaxed flex-grow">{selectedNode.description}</p>
                 <div className="mt-4 pt-4 border-t border-black/5">
                    <Button onClick={handleGetSuggestion} disabled={isSuggestionLoading} className="w-full">
                        <SparklesIcon className="w-5 h-5 mr-2"/>
                        {isSuggestionLoading ? 'Thinking...' : 'Get AI Suggestion'}
                    </Button>
                    {isSuggestionLoading && (
                         <div className="space-y-2 mt-3 animate-pulse">
                            <div className="h-3 bg-neutral-light/50 rounded-md w-full"></div>
                            <div className="h-3 bg-neutral-light/50 rounded-md w-5/6"></div>
                        </div>
                    )}
                    {suggestionError && <p className="text-sm text-danger text-center mt-2">{suggestionError}</p>}
                    {aiSuggestion && (
                        <div className="mt-3 p-3 bg-primary/10 border-l-4 border-primary rounded-r-lg animate-fade-in">
                            <p className="text-sm text-neutral-dark">{aiSuggestion}</p>
                        </div>
                    )}
                </div>
             </Card>
          );
      }

      return (
        <div className="flex flex-col gap-6">
            <Card>
                <h3 className="font-bold text-neutral-dark mb-4 text-lg">Legend</h3>
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase text-neutral-medium tracking-wider">Topics</h4>
                    {groups.map(group => (
                        <div key={group} className="flex items-center text-sm">
                            <span className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: colorScale(group) }}></span>
                            <span className="text-neutral-dark font-medium">{group}</span>
                        </div>
                    ))}
                    <div className="pt-2">
                        <h4 className="text-sm font-semibold uppercase text-neutral-medium tracking-wider">Indicators</h4>
                        <div className="flex items-center text-sm mt-2">
                            <TrendingUpIcon className="w-4 h-4 mr-2 text-success"/>
                            <span className="text-neutral-dark font-medium">Mastery Increased</span>
                        </div>
                        <div className="flex items-center text-sm mt-2">
                            <TrendingDownIcon className="w-4 h-4 mr-2 text-danger"/>
                            <span className="text-neutral-dark font-medium">Mastery Decreased</span>
                        </div>
                         <div className="flex items-center text-sm mt-2">
                           <div className="w-4 h-4 mr-2 relative flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full border-2 border-warning-dark"></div>
                           </div>
                            <span className="text-neutral-dark font-medium">Suggested Focus</span>
                        </div>
                    </div>
                </div>
            </Card>
            <Card>
                <div className="flex items-center mb-4">
                    <LightbulbIcon className="h-6 w-6 text-warning-dark mr-3" />
                    <h2 className="text-xl font-bold font-display text-neutral-extradark">{aiSummaryTitle}</h2>
                </div>
                <p className="text-neutral-dark text-md leading-relaxed">{aiSummaryText}</p>
            </Card>
        </div>
      );
  }

  return (
    <>
      <style>{`
          @keyframes pulse { 0% { stroke-opacity: 1; transform: scale(1); } 50% { stroke-opacity: 0.2; transform: scale(1.1); } 100% { stroke-opacity: 1; transform: scale(1); } }
      `}</style>
        <header className="mb-8">
          <div className="flex items-center">
            <Share2Icon className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">Knowledge Graph</h1>
          </div>
          <p className="text-lg text-neutral-medium mt-1">
            {isTeacherView ? "A map of your class's collective knowledge." : "A map of your personal learning journey."}
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow lg:w-2/3" ref={containerRef}>
            <Card className="relative overflow-hidden aspect-[4/3] !p-0">
                <svg ref={svgRef} className="w-full h-full rounded-xl"></svg>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button onClick={() => handleZoom('in')} className="w-8 h-8 rounded-lg bg-surface/50 backdrop-blur-lg flex items-center justify-center text-neutral-dark hover:bg-surface/80">+</button>
                    <button onClick={() => handleZoom('out')} className="w-8 h-8 rounded-lg bg-surface/50 backdrop-blur-lg flex items-center justify-center text-neutral-dark hover:bg-surface/80">-</button>
                    <button onClick={handleResetZoom} className="w-8 h-8 rounded-lg bg-surface/50 backdrop-blur-lg flex items-center justify-center text-neutral-dark hover:bg-surface/80">&#x21BB;</button>
                </div>
                <Tooltip node={hoveredNode} position={tooltipPosition} color={hoveredNode?.group ? colorScale(hoveredNode.group) : '#334155'}/>
            </Card>
          </div>
          <aside className="lg:w-1/3 flex-shrink-0">
            {renderSidebarContent()}
          </aside>
        </div>
    </>
  );
};

export default KnowledgeGraphView;