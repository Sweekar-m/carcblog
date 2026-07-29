import React, { useState } from 'react';
import {
  Eye, Users, Clock, TrendingUp, Heart, Bookmark, MessageSquare, Globe, Laptop, Download, Share2, Sparkles
} from 'lucide-react';
import type { WriterAnalyticsSummary } from '@/lib/analytics';

interface AnalyticsDashboardViewProps {
  analytics: WriterAnalyticsSummary;
}

export default function AnalyticsDashboardView({ analytics }: AnalyticsDashboardViewProps) {
  const [timeRange, setTimeRange] = useState<'30d' | '7d' | 'all'>('30d');

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,Views\n"
      + analytics.views30Days.map(e => `${e.date},${e.views}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `carcblog_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: '32px 0' }}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink mb-1">Writer Performance Analytics</h1>
          <p className="text-steel text-xs sm:text-sm">Track engagement, readership growth, traffic origins, and read depth.</p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border border-hairline bg-canvas text-ink font-semibold text-xs sm:text-sm min-h-[44px] w-full sm:w-auto shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Primary KPI Grid (8 metrics) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        
        <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-steel)' }}>Total Article Views</span>
            <Eye style={{ width: '18px', height: '18px', color: 'var(--color-accent)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-ink)' }}>{analytics.totalViews.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>+18.4% this month</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-steel)' }}>Unique Visitors</span>
            <Users style={{ width: '18px', height: '18px', color: 'var(--color-accent)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-ink)' }}>{analytics.uniqueVisitors.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>+12.1% unique readers</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-steel)' }}>Avg. Read Completion</span>
            <Clock style={{ width: '18px', height: '18px', color: 'var(--color-accent)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-ink)' }}>{analytics.readCompletionPct}%</div>
          <div style={{ fontSize: '12px', color: 'var(--color-steel)', marginTop: '4px' }}>~{Math.round(analytics.avgReadTimeSeconds / 60)} min read duration</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-steel)' }}>Followers Gained</span>
            <TrendingUp style={{ width: '18px', height: '18px', color: 'var(--color-accent)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-ink)' }}>+{analytics.followersGained}</div>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600, marginTop: '4px' }}>Conversion CTR: 5.2%</div>
        </div>

      </div>

      {/* 30-Day Growth Timeline Chart representation */}
      <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '20px', padding: '28px', marginBottom: '32px', boxShadow: 'var(--shadow-card)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--color-ink)' }}>30-Day Readership Traffic Growth</h3>
        
        {/* Simple CSS Bar Chart Visualization */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '180px', paddingTop: '20px', borderBottom: '1px solid var(--color-hairline)' }}>
          {analytics.views30Days.map((day, idx) => {
            const heightPct = Math.max(15, Math.min(100, (day.views + 10) * 4));
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }} title={`${day.date}: ${day.views} views`}>
                <div style={{ width: '100%', height: `${heightPct}%`, background: 'var(--color-primary, #0F172A)', borderRadius: '4px 4px 0 0', transition: 'height 300ms ease' }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-stone)', marginTop: '8px' }}>
          <span>30 Days Ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Top Countries */}
        <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Globe style={{ width: '18px', height: '18px', color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Top Reader Countries</h4>
          </div>
          {analytics.topCountries.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-hairline-soft)', fontSize: '14px' }}>
              <span style={{ fontWeight: 600 }}>{c.country}</span>
              <span style={{ color: 'var(--color-steel)' }}>{c.count.toLocaleString()} views</span>
            </div>
          ))}
        </div>

        {/* Traffic Sources */}
        <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Share2 style={{ width: '18px', height: '18px', color: 'var(--color-accent)' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Traffic Origin Sources</h4>
          </div>
          {analytics.trafficSources.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-hairline-soft)', fontSize: '14px' }}>
              <span style={{ fontWeight: 600 }}>{s.source}</span>
              <span style={{ color: 'var(--color-steel)' }}>{s.count.toLocaleString()} visits</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
