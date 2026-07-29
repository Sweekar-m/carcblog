import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick: (step: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps = 7,
  onStepClick,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
      {steps.map((s) => (
        <div
          key={s}
          onClick={() => s < currentStep && onStepClick(s)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background:
              currentStep === s
                ? 'var(--color-primary, #0F172A)'
                : currentStep > s
                ? 'var(--color-accent, #0EA5E9)'
                : 'var(--color-surface, #F8FAFC)',
            color: currentStep >= s ? '#ffffff' : 'var(--color-slate, #64748B)',
            fontWeight: 700,
            fontSize: '14px',
            cursor: s < currentStep ? 'pointer' : 'default',
            transition: 'all 200ms ease',
          }}
        >
          {currentStep > s ? <CheckCircle2 style={{ width: '18px', height: '18px' }} /> : s}
        </div>
      ))}
    </div>
  );
};
