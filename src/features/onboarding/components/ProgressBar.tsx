import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick: (step: number) => void;
}

const STEP_LABELS = ['1. Identity', '2. Feed Setup', '3. Launch'];

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps = 3,
  onStepClick,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
      {steps.map((s, index) => {
        const isCurrent = currentStep === s;
        const isCompleted = currentStep > s;
        const label = STEP_LABELS[index] || `Step ${s}`;

        return (
          <div
            key={s}
            onClick={() => s < currentStep && onStepClick(s)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: s < currentStep ? 'pointer' : 'default',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isCurrent
                  ? 'var(--color-primary, #0F172A)'
                  : isCompleted
                  ? 'var(--color-accent, #0EA5E9)'
                  : 'var(--color-surface, #F8FAFC)',
                border: isCurrent
                  ? '2px solid var(--color-primary, #0F172A)'
                  : isCompleted
                  ? '2px solid var(--color-accent, #0EA5E9)'
                  : '1px solid var(--color-hairline, #E2E8F0)',
                color: isCurrent || isCompleted ? '#ffffff' : 'var(--color-slate, #64748B)',
                fontWeight: 700,
                fontSize: '14px',
                transition: 'all 200ms ease',
              }}
            >
              {isCompleted ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : s}
            </div>
            <span
              style={{
                fontSize: '14px',
                fontWeight: isCurrent ? 700 : 500,
                color: isCurrent
                  ? 'var(--color-ink, #0F172A)'
                  : isCompleted
                  ? 'var(--color-steel, #64748B)'
                  : 'var(--color-stone, #94A3B8)',
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
