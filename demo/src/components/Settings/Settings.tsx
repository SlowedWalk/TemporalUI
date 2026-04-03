import { useState } from 'react';
import { Temporal, AdaptiveSlot, AdaptiveTier } from '@temporalui/react';
import { useAuth } from '../../lib/auth';
import type { Tier } from '@temporalui/react';

export default function Settings() {
  const { user, updateTier, logout } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleTierChange = async (tier: Tier) => {
    if (!user) return;
    await updateTier(tier);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Temporal id="settings" domain="app" coldStartTier="T0">
      <div className="settings">
        <h1>Settings</h1>
        
        <AdaptiveSlot>
          <AdaptiveTier tier="T0">
            <SettingsT0 
              user={user} 
              onTierChange={handleTierChange} 
              onLogout={logout}
              saved={saved}
            />
          </AdaptiveTier>
          <AdaptiveTier tier="T1">
            <SettingsT1 
              user={user} 
              onTierChange={handleTierChange}
              onLogout={logout}
            />
          </AdaptiveTier>
          <AdaptiveTier tier="T2">
            <SettingsT2 
              user={user} 
              onTierChange={handleTierChange}
              onLogout={logout}
            />
          </AdaptiveTier>
          <AdaptiveTier tier="T3">
            <SettingsT3 
              user={user} 
              onTierChange={handleTierChange}
              onLogout={logout}
            />
          </AdaptiveTier>
        </AdaptiveSlot>
      </div>
    </Temporal>
  );
}

interface SettingsProps {
  user: { id: string; name: string | null; email: string; tier: string } | null;
  onTierChange: (tier: Tier) => void;
  onLogout: () => void;
  saved?: boolean;
}

function SettingsT0({ user, onTierChange, onLogout, saved }: SettingsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="settings-container t0">
      <section className="settings-section">
        <h2>Profile</h2>
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={user?.name || ''} disabled />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email || ''} disabled />
        </div>
      </section>

      <section className="settings-section">
        <h2>Interface Tier</h2>
        <p className="settings-description">
          Choose how much guidance you want. Your interface will adapt based on your usage.
        </p>
        <div className="tier-selector">
          <TierOption tier="T0" label="Beginner" description="Full guidance and explanations" onSelect={onTierChange} currentTier={user?.tier || 'T0'} />
          <TierOption tier="T1" label="Novice" description="Some help, tooltips on hover" onSelect={onTierChange} currentTier={user?.tier || 'T0'} />
          <TierOption tier="T2" label="Intermediate" description="Compact, abbreviated labels" onSelect={onTierChange} currentTier={user?.tier || 'T0'} />
          <TierOption tier="T3" label="Expert" description="Minimal UI, keyboard-first" onSelect={onTierChange} currentTier={user?.tier || 'T0'} />
        </div>
        {saved && <div className="success-message">Settings saved!</div>}
      </section>

      <section className="settings-section danger">
        <h2>Account</h2>
        <p>Want to start fresh? Clear all your data and reset your tier.</p>
        <div className="help-card">
          <h3>What happens when you reset?</h3>
          <ul>
            <li>All your tasks will be deleted</li>
            <li>Your proficiency tier resets to T0</li>
            <li>You can log in again with the same account</li>
          </ul>
        </div>
        {!showConfirm ? (
          <button className="btn-danger" onClick={() => setShowConfirm(true)}>
            Reset All Data
          </button>
        ) : (
          <div className="confirm-box">
            <p>Are you sure?</p>
            <button className="btn-danger" onClick={() => {
              localStorage.removeItem('temporalui_tasks');
              onLogout();
            }}>
              Yes, Reset Everything
            </button>
            <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function SettingsT1({ user, onTierChange, onLogout }: SettingsProps) {
  return (
    <div className="settings-container t1">
      <section className="settings-section">
        <h2>Profile</h2>
        <p>{user?.name} ({user?.email})</p>
      </section>

      <section className="settings-section">
        <h2>Interface Tier</h2>
        <select 
          value={user?.tier} 
          onChange={(e) => onTierChange(e.target.value as Tier)}
          className="tier-select"
        >
          <option value="T0">T0 - Beginner</option>
          <option value="T1">T1 - Novice</option>
          <option value="T2">T2 - Intermediate</option>
          <option value="T3">T3 - Expert</option>
        </select>
      </section>

      <section className="settings-section">
        <button className="btn-danger" onClick={onLogout}>
          Logout
        </button>
      </section>
    </div>
  );
}

function SettingsT2({ user, onTierChange, onLogout }: SettingsProps) {
  return (
    <div className="settings-container t2">
      <div className="setting-row">
        <label>Tier</label>
        <select 
          value={user?.tier} 
          onChange={(e) => onTierChange(e.target.value as Tier)}
        >
          <option value="T0">T0</option>
          <option value="T1">T1</option>
          <option value="T2">T2</option>
          <option value="T3">T3</option>
        </select>
      </div>
      <div className="setting-row">
        <button onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

function SettingsT3({ onLogout }: SettingsProps) {
  return (
    <div className="settings-container t3">
      <div className="settings-dense">
        <span onClick={onLogout}>[logout]</span>
      </div>
    </div>
  );
}

interface TierOptionProps {
  tier: Tier;
  label: string;
  description: string;
  onSelect: (tier: Tier) => void;
  currentTier: string;
}

function TierOption({ tier, label, description, onSelect, currentTier }: TierOptionProps) {
  return (
    <div 
      className={`tier-option ${currentTier === tier ? 'selected' : ''}`}
      onClick={() => onSelect(tier)}
    >
      <h3>{tier}: {label}</h3>
      <p>{description}</p>
    </div>
  );
}
