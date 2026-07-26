import React, { useState, useEffect } from 'react';
import {
  Sparkles, Save, Image, Code, Table, Video, Check, AlertCircle, FileText, Send, Undo, Redo, RefreshCw, Wand2, Eye
} from 'lucide-react';

export default function RichEditorV2() {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tags, setTags] = useState('AI, SaaS, Tech');

  // AI Modal States
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAction, setAiAction] = useState<'rewrite' | 'grammar' | 'summarize' | 'cover' | 'seo'>('rewrite');
  const [aiLoading, setAiLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  // Draft recovery check on mount
  useEffect(() => {
    const saved = localStorage.getItem('carcblog_draft_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title || parsed.content) {
          setTitle(parsed.title || '');
          setExcerpt(parsed.excerpt || '');
          setContent(parsed.content || '');
          setCoverUrl(parsed.coverUrl || '');
        }
      } catch (e) {}
    }
  }, []);

  // Autosave to localStorage every 3 seconds
  useEffect(() => {
    setSaveStatus('unsaved');
    const timer = setTimeout(() => {
      localStorage.setItem('carcblog_draft_v2', JSON.stringify({ title, excerpt, content, coverUrl, updatedAt: new Date().toISOString() }));
      setSaveStatus('saved');
    }, 1500);
    return () => clearTimeout(timer);
  }, [title, excerpt, content, coverUrl]);

  const handleAIRun = async () => {
    setAiLoading(true);
    setTimeout(() => {
      if (aiAction === 'rewrite') {
        setContent(prev => `${prev}\n\n[AI Rewritten Output]: Refined and expanded upon key tech trends with magazine-grade narrative flow.`);
      } else if (aiAction === 'grammar') {
        alert('Grammar check complete! All text is formatted to design.md standards.');
      } else if (aiAction === 'summarize') {
        setExcerpt('Summary: High-impact analysis of venture capital trends and developer tooling innovations.');
      } else if (aiAction === 'cover') {
        setCoverUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80');
      } else if (aiAction === 'seo') {
        setTags('AI, Startups, VentureCapital, SoftwareEngineering');
      }
      setAiLoading(false);
      setAiModalOpen(false);
    }, 1000);
  };

  const handleInsertBlock = (blockType: string) => {
    if (blockType === 'table') {
      setContent(prev => `${prev}\n\n| Industry | Growth (YoY) | Valuation |\n|---|---|---|\n| AI Infrastructure | +142% | $12.5B |\n| SaaS & B2B | +38% | $8.2B |\n`);
    } else if (blockType === 'code') {
      setContent(prev => `${prev}\n\n\`\`\`typescript\n// CarcBlog V2 Engine\nexport function calculateMetrics(views: number) {\n  return { ctr: (views * 0.12).toFixed(2) };\n}\n\`\`\`\n`);
    } else if (blockType === 'callout') {
      setContent(prev => `${prev}\n\n> 💡 **KEY TAKEAWAY**: Technical founders building modular AI infrastructure are raising seed rounds 2.5x faster in 2026.\n`);
    } else if (blockType === 'mermaid') {
      setContent(prev => `${prev}\n\n\`\`\`mermaid\ngraph TD;\n    A[Reader Signup] --> B[7-Step Onboarding];\n    B --> C[Personalized Feed];\n    C --> D[Creator Engagement];\n\`\`\`\n`);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      
      {/* Top Editor Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '16px', padding: '14px 24px', marginBottom: '24px', boxShadow: 'var(--shadow-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '9999px', background: 'var(--color-surface)', border: '1px solid var(--color-hairline)', color: 'var(--color-slate)' }}>
            DRAFT
          </span>
          <span style={{ fontSize: '13px', color: 'var(--color-steel)' }}>
            {saveStatus === 'saved' ? '✓ Auto-saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved changes'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setAiModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '9999px', border: '1px solid var(--color-accent)', background: 'rgba(14, 165, 233, 0.08)', color: 'var(--color-accent)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            <Sparkles style={{ width: '15px', height: '15px' }} />
            AI Assistant
          </button>
          <button
            onClick={() => alert('Article draft published successfully!')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '9999px', border: 'none', background: 'var(--color-primary, #0F172A)', color: '#ffffff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >
            Publish Article
          </button>
        </div>
      </div>

      {/* Editor Body Card */}
      <div style={{ background: '#ffffff', border: '1px solid var(--color-hairline)', borderRadius: '20px', padding: '40px', boxShadow: 'var(--shadow-card)' }}>
        
        {/* Cover Photo Slot */}
        <div style={{ marginBottom: '24px' }}>
          {coverUrl ? (
            <div style={{ position: 'relative', height: '220px', borderRadius: '14px', overflow: 'hidden', marginBottom: '12px' }}>
              <img src={coverUrl} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button onClick={() => setCoverUrl('')} style={{ position: 'absolute', top: '12px', right: '12px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', fontSize: '12px', cursor: 'pointer' }}>
                Remove Cover
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCoverUrl('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: '1px dashed var(--color-hairline-strong)', background: 'var(--color-surface)', fontSize: '13px', fontWeight: 600, color: 'var(--color-steel)', cursor: 'pointer' }}
            >
              <Image style={{ width: '16px', height: '16px' }} />
              + Add Cover Image (Unsplash / Pexels)
            </button>
          )}
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Article Title..."
          style={{ width: '100%', fontSize: '2.25rem', fontWeight: 800, border: 'none', outline: 'none', color: 'var(--color-ink)', fontFamily: 'var(--font-serif, Georgia)', marginBottom: '16px' }}
        />

        {/* Excerpt Input */}
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Subtitle / Short Excerpt..."
          rows={2}
          style={{ width: '100%', fontSize: '1.125rem', border: 'none', outline: 'none', color: 'var(--color-steel)', fontFamily: 'inherit', resize: 'none', marginBottom: '24px' }}
        />

        {/* Quick Block Toolbar */}
        <div style={{ display: 'flex', gap: '8px', padding: '8px 12px', background: 'var(--color-surface)', borderRadius: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => handleInsertBlock('table')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Table</button>
          <button onClick={() => handleInsertBlock('code')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Code Block</button>
          <button onClick={() => handleInsertBlock('callout')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Callout Quote</button>
          <button onClick={() => handleInsertBlock('mermaid')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>+ Mermaid Diagram</button>
        </div>

        {/* Main Content Area */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Tell your story... (Supports Markdown, Slash Commands, Tables, Code Blocks)"
          rows={16}
          style={{ width: '100%', fontSize: '1rem', lineHeight: 1.7, border: 'none', outline: 'none', color: 'var(--color-ink)', fontFamily: 'inherit', resize: 'vertical' }}
        />
      </div>

      {/* AI Assistant Modal */}
      {aiModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', width: '500px', maxWidth: '90%', boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>CarcBlog AI Co-Writer</h3>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {(['rewrite', 'grammar', 'summarize', 'cover', 'seo'] as const).map(act => (
                <button
                  key={act}
                  onClick={() => setAiAction(act)}
                  style={{ padding: '6px 14px', borderRadius: '9999px', border: 'none', background: aiAction === act ? 'var(--color-primary)' : 'var(--color-surface)', color: aiAction === act ? '#fff' : 'var(--color-ink)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {act}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setAiModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '9999px', border: '1px solid var(--color-hairline)', background: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAIRun} disabled={aiLoading} style={{ padding: '8px 20px', borderRadius: '9999px', border: 'none', background: 'var(--color-accent)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                {aiLoading ? 'Generating...' : 'Run AI Action'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
