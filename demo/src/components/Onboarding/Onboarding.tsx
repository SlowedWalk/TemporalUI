import { useState, useEffect } from 'react';
import { Temporal, AdaptiveSlot, AdaptiveTier } from '@temporalui/react';
import { useAuth } from '../../lib/auth';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome', description: 'Learn how to use this application effectively' },
  { id: 'tasks', title: 'Managing Tasks', description: 'Create and organize your tasks' },
  { id: 'data', title: 'Data Entry', description: 'Enter your financial data' },
  { id: 'customize', title: 'Customize', description: 'Set up your preferences' },
  { id: 'complete', title: 'Ready!', description: 'You\'re all set to start using the app' },
];

export default function Onboarding() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    
    const stored = localStorage.getItem('temporalui_onboarding');
    if (stored) {
      const data = JSON.parse(stored);
      if (data[user.id]) {
        setCompletedSteps(data[user.id]);
        const lastCompleted = data[user.id].length - 1;
        if (lastCompleted >= 0) {
          setCurrentStep(Math.min(lastCompleted + 1, ONBOARDING_STEPS.length - 1));
        }
      }
    }
  }, [user]);

  const completeStep = async (stepId: string) => {
    if (!user) return;

    const newCompleted = [...completedSteps, stepId];
    setCompletedSteps(newCompleted);
    
    const stored = localStorage.getItem('temporalui_onboarding') || '{}';
    const data = JSON.parse(stored);
    data[user.id] = newCompleted;
    localStorage.setItem('temporalui_onboarding', JSON.stringify(data));

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const skipOnboarding = () => {
    if (!user) return;

    const newCompleted = ONBOARDING_STEPS.map(s => s.id);
    setCompletedSteps(newCompleted);
    
    const stored = localStorage.getItem('temporalui_onboarding') || '{}';
    const data = JSON.parse(stored);
    data[user.id] = newCompleted;
    localStorage.setItem('temporalui_onboarding', JSON.stringify(data));
  };

  const step = ONBOARDING_STEPS[currentStep];

  return (
    <Temporal id="onboarding" domain="app" coldStartTier="T0">
      <div className="onboarding">
        <h1>Welcome to TemporalUI</h1>
        
        <AdaptiveSlot>
          <AdaptiveTier tier="T0">
            <OnboardingT0 
              step={step}
              currentStep={currentStep}
              totalSteps={ONBOARDING_STEPS.length}
              onComplete={() => completeStep(step.id)}
              onSkip={skipOnboarding}
              showTooltip={showTooltip}
              setShowTooltip={setShowTooltip}
            />
          </AdaptiveTier>
          <AdaptiveTier tier="T1">
            <OnboardingT1 
              step={step}
              currentStep={currentStep}
              onComplete={() => completeStep(step.id)}
              onSkip={skipOnboarding}
            />
          </AdaptiveTier>
          <AdaptiveTier tier="T2">
            <OnboardingT2 
              step={step}
              currentStep={currentStep}
              onComplete={() => completeStep(step.id)}
              onSkip={skipOnboarding}
            />
          </AdaptiveTier>
          <AdaptiveTier tier="T3">
            <OnboardingT3 
              onSkip={skipOnboarding}
            />
          </AdaptiveTier>
        </AdaptiveSlot>
      </div>
    </Temporal>
  );
}

interface OnboardingProps {
  step: OnboardingStep;
  currentStep: number;
  totalSteps?: number;
  onComplete: () => void;
  onSkip: () => void;
  showTooltip?: string | null;
  setShowTooltip?: (id: string | null) => void;
}

function OnboardingT0({ 
  step, 
  currentStep, 
  totalSteps = 5, 
  onComplete, 
  onSkip,
  showTooltip,
  setShowTooltip,
}: OnboardingProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="onboarding-container t0">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="progress-text">Step {currentStep + 1} of {totalSteps}</p>

      <div className="onboarding-card">
        <div 
          className="onboarding-header"
          onMouseEnter={() => setShowTooltip?.(step.id)}
          onMouseLeave={() => setShowTooltip?.(null)}
        >
          <h2>{step.title}</h2>
          {showTooltip === step.id && (
            <div className="tooltip">
              This guided walkthrough helps you learn the app step by step.
            </div>
          )}
        </div>
        <p className="onboarding-description">{step.description}</p>

        <div className="onboarding-features">
          <div className="feature">
            <span className="feature-icon">📊</span>
            <div>
              <h4>Dashboard</h4>
              <p>View your stats at a glance</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">✓</span>
            <div>
              <h4>Tasks</h4>
              <p>Track what needs to be done</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">📝</span>
            <div>
              <h4>Data Entry</h4>
              <p>Record your transactions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="onboarding-actions">
        <button className="btn-primary" onClick={onComplete}>
          {currentStep === totalSteps - 1 ? 'Get Started' : 'Next'}
        </button>
        <button className="btn-link" onClick={onSkip}>
          Skip Tour
        </button>
      </div>

      <div className="help-card">
        <h3>Why take the tour?</h3>
        <p>The more you use the app, the more it learns about your preferences. 
        Your interface will adapt automatically as you become more familiar with the features.</p>
      </div>
    </div>
  );
}

function OnboardingT1({ step, currentStep, onComplete, onSkip }: OnboardingProps) {
  return (
    <div className="onboarding-container t1">
      <div className="progress-dots">
        {ONBOARDING_STEPS.map((_, i) => (
          <span key={i} className={i === currentStep ? 'active' : ''}></span>
        ))}
      </div>

      <div className="onboarding-card">
        <h2>{step.title}</h2>
        <p>{step.description}</p>
      </div>

      <div className="onboarding-actions">
        <button className="btn-primary" onClick={onComplete}>
          {currentStep === 4 ? 'Done' : 'Next'}
        </button>
        <button className="btn-link" onClick={onSkip}>Skip</button>
      </div>
    </div>
  );
}

function OnboardingT2({ step, currentStep, onComplete, onSkip }: OnboardingProps) {
  return (
    <div className="onboarding-container t2">
      <div className="step-indicator">{currentStep + 1}/5</div>
      <h2>{step.title}</h2>
      <p>{step.description}</p>
      <div className="actions-row">
        <button onClick={onComplete}>
          {currentStep === 4 ? '→' : '→'}
        </button>
        <button onClick={onSkip}>×</button>
      </div>
    </div>
  );
}

function OnboardingT3({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="onboarding-container t3">
      <div className="skip-mini" onClick={onSkip}>
        [skip tour]
      </div>
    </div>
  );
}
