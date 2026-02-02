import React from 'react';

const AIInsightsPanel = ({ type = 'general', onClose }) => {
  const getContent = () => {
    switch (type) {
      case 'anomaly':
        return {
          title: 'AI Pattern Detection',
          icon: 'search',
          insights: [
            '🔍 Detected 3 shipments with unusual routing patterns (LAX → MEM → LAX loop)',
            '⚠️ High correlation between CDG hub delays and Paris weather events (r=0.87)',
            '📊 Route MEM-IND-CDG shows 15% higher delay rate vs. direct MEM-CDG',
            '🎯 Recommend re-routing 12 priority shipments via alternate hubs',
          ],
        };
      case 'briefing':
        return {
          title: 'Shift Briefing Summary',
          icon: 'description',
          insights: [
            '✅ Network Status: 97.2% on-time across all regions',
            '⚠️ Active Alerts: IND hub at 94% capacity (critical threshold)',
            '🌨️ Weather Impact: CDG experiencing de-icing delays (+15m avg)',
            '📈 Volume Trend: +2.4% vs. yesterday, within normal variance',
            '🚨 Priority Actions: Monitor IND backlog, prepare CDG contingency',
          ],
        };
      case 'balancer':
        return {
          title: 'Network Optimization Strategy',
          icon: 'psychology',
          insights: [
            '**Recommended Actions:**',
            '',
            '1. **Re-route IND-bound shipments** → Divert 40% of MEM→IND volume to ORD hub',
            '   • Expected impact: -18% IND load, +8% ORD load',
            '   • Risk mitigation: Reduces critical capacity breach probability by 72%',
            '',
            '2. **Adjust CDG flight schedules** → Delay 2 inbound flights by 30m',
            '   • Rationale: Weather window opens 14:30 UTC',
            '   • Net benefit: Avoid +2h ground delays for 450 packages',
            '',
            '3. **Staff optimization** → Allocate +15 staff to IND sort facility',
            '   • Forecast: Peak volume window 18:00-22:00 local',
            '',
            '**Confidence Score:** 92% | **Estimated savings:** $24,500',
          ],
        };
      default:
        return {
          title: 'AI Insights',
          icon: 'lightbulb',
          insights: ['No insights available for this context.'],
        };
    }
  };

  const content = getContent();

  return (
    <div className="bg-gradient-to-r from-purple-50 to-white border-l-4 border-[#4D148C] p-6 rounded shadow-lg relative overflow-hidden">
      {/* Background Icon */}
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <span className="material-icons" style={{ fontSize: '120px' }}>
          {content.icon}
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-[#4D148C] text-white flex items-center justify-center mr-3 shadow-md">
            <span className="material-icons">auto_awesome</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800">{content.title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-icons">close</span>
            </button>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          {content.insights.map((insight, index) => (
            <p key={index} className="leading-relaxed">
              {insight}
            </p>
          ))}
        </div>

        {type === 'balancer' && (
          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-[#4D148C] text-white text-sm font-bold rounded shadow-sm hover:bg-[#3e0f73] transition-colors">
              Execute Re-Route
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded hover:bg-gray-50 transition-colors">
              Simulate Impact
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsightsPanel;
