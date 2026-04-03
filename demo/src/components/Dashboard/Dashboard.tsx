import { useState, useEffect } from 'react';
import { Temporal, AdaptiveSlot, AdaptiveTier, useTemporal } from '@temporalui/react';
import { useAuth } from '../../lib/auth';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
}

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  highPriority: number;
  sessionCount: number;
  lastActive: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    highPriority: 0,
    sessionCount: 0,
    lastActive: 'Never',
  });

  useEffect(() => {
    if (!user) return;
    
    // Load tasks from localStorage
    const storedTasks = JSON.parse(localStorage.getItem('temporalui_tasks') || '[]');
    const userTasks = storedTasks.filter((t: Task & { userId: string }) => t.userId === user.id);
    
    // Load session count
    const sessionCount = parseInt(localStorage.getItem('temporalui_session_count') || '1');
    const lastActive = localStorage.getItem('temporalui_last_login') || 'Never';

    setStats({
      totalTasks: userTasks.length,
      completedTasks: userTasks.filter((t: Task) => t.completed).length,
      pendingTasks: userTasks.filter((t: Task) => !t.completed).length,
      highPriority: userTasks.filter((t: Task) => t.priority === 'high' && !t.completed).length,
      sessionCount,
      lastActive,
    });
  }, [user]);

  return (
    <Temporal id="dashboard" domain="app" coldStartTier="T0">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <TierBadge />
        </div>

        <AdaptiveSlot>
          <AdaptiveTier tier="T0">
            <DashboardT0 stats={stats} />
          </AdaptiveTier>
          <AdaptiveTier tier="T1">
            <DashboardT1 stats={stats} />
          </AdaptiveTier>
          <AdaptiveTier tier="T2">
            <DashboardT2 stats={stats} />
          </AdaptiveTier>
          <AdaptiveTier tier="T3">
            <DashboardT3 stats={stats} />
          </AdaptiveTier>
        </AdaptiveSlot>
      </div>
    </Temporal>
  );
}

function TierBadge() {
  const { tier } = useTemporal('dashboard');
  return (
    <div className="tier-badge">
      Current Tier: <span className={`tier-${tier.toLowerCase()}`}>{tier}</span>
    </div>
  );
}

function DashboardT0({ stats }: { stats: DashboardStats }) {
  return (
    <div className="stats-grid t0">
      <StatCard
        title="Total Tasks"
        value={stats.totalTasks}
        description="All tasks in your list"
        tooltip="This shows your total number of tasks"
        color="#4f46e5"
      />
      <StatCard
        title="Completed"
        value={stats.completedTasks}
        description="Tasks you've finished"
        tooltip="Great job! These tasks are done"
        color="#22c55e"
      />
      <StatCard
        title="Pending"
        value={stats.pendingTasks}
        description="Tasks still to do"
        tooltip="Keep going! These need attention"
        color="#f59e0b"
      />
      <StatCard
        title="High Priority"
        value={stats.highPriority}
        description="Urgent tasks"
        tooltip="These need immediate attention"
        color="#ef4444"
      />
      <StatCard
        title="Sessions"
        value={stats.sessionCount}
        description="Times you've logged in"
        tooltip="Each session counts toward your expertise"
        color="#8b5cf6"
      />
      <StatCard
        title="Last Active"
        value={stats.lastActive}
        description="Most recent login"
        tooltip="Your last login date"
        color="#06b6d4"
      />
      <div className="help-card">
        <h3>Need Help?</h3>
        <p>Hover over any card to learn more. Your interface will adapt as you become more familiar with the app.</p>
      </div>
    </div>
  );
}

function DashboardT1({ stats }: { stats: DashboardStats }) {
  return (
    <div className="stats-grid t1">
      <StatCard title="Total" value={stats.totalTasks} color="#4f46e5" />
      <StatCard title="Done" value={stats.completedTasks} color="#22c55e" />
      <StatCard title="Pending" value={stats.pendingTasks} color="#f59e0b" />
      <StatCard title="Urgent" value={stats.highPriority} color="#ef4444" />
      <StatCard title="Sessions" value={stats.sessionCount} color="#8b5cf6" />
      <StatCard title="Last Active" value={stats.lastActive} color="#06b6d4" />
    </div>
  );
}

function DashboardT2({ stats }: { stats: DashboardStats }) {
  return (
    <div className="stats-grid t2 compact">
      <StatCardSmall label="Total" value={stats.totalTasks} />
      <StatCardSmall label="Done" value={stats.completedTasks} />
      <StatCardSmall label="Pending" value={stats.pendingTasks} />
      <StatCardSmall label="Urgent" value={stats.highPriority} />
      <StatCardSmall label="Sessions" value={stats.sessionCount} />
    </div>
  );
}

function DashboardT3({ stats }: { stats: DashboardStats }) {
  return (
    <div className="stats-grid t3 dense">
      <div className="stat-mini">
        <span className="stat-value">{stats.totalTasks}</span>
        <span className="stat-label">total</span>
      </div>
      <div className="stat-mini">
        <span className="stat-value">{stats.completedTasks}</span>
        <span className="stat-label">done</span>
      </div>
      <div className="stat-mini">
        <span className="stat-value">{stats.pendingTasks}</span>
        <span className="stat-label">pend</span>
      </div>
      <div className="stat-mini">
        <span className="stat-value">{stats.highPriority}</span>
        <span className="stat-label">!</span>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  tooltip?: string;
  color: string;
}

function StatCard({ title, value, description, tooltip, color }: StatCardProps) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-header">
        <h3>{title}</h3>
        {tooltip && <span className="tooltip-hint" title={tooltip}>?</span>}
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {description && <p className="stat-description">{description}</p>}
    </div>
  );
}

function StatCardSmall({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="stat-card-small">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
