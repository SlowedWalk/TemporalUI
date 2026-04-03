import { useState, useEffect } from 'react';
import { Temporal, AdaptiveSlot, AdaptiveTier } from '@temporalui/react';
import { useAuth } from '../../lib/auth';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  userId?: string;
}

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');

  useEffect(() => {
    if (!user) return;
    const storedTasks = JSON.parse(localStorage.getItem('temporalui_tasks') || '[]');
    const userTasks = storedTasks.filter((t: Task & { userId: string }) => t.userId === user.id);
    setTasks(userTasks);
  }, [user]);

  const saveTasks = (newTasks: Task[]) => {
    const storedTasks = JSON.parse(localStorage.getItem('temporalui_tasks') || '[]');
    const otherTasks = storedTasks.filter((t: Task & { userId: string }) => t.userId !== user?.id);
    const updatedTasks = [...otherTasks, ...newTasks];
    localStorage.setItem('temporalui_tasks', JSON.stringify(updatedTasks));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      priority: newTaskPriority,
      completed: false,
      userId: user.id,
    };

    const newTasks = [task, ...tasks];
    setTasks(newTasks);
    saveTasks(newTasks);
    setNewTaskTitle('');
  };

  const toggleTask = (task: Task) => {
    const newTasks = tasks.map(t => 
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  const deleteTask = (taskId: string) => {
    const newTasks = tasks.filter(t => t.id !== taskId);
    setTasks(newTasks);
    saveTasks(newTasks);
  };

  return (
    <Temporal id="task-list" domain="tasks" coldStartTier="T0">
      <div className="task-list">
        <h1>Tasks</h1>
        
        <form onSubmit={addTask} className="add-task-form">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="task-input"
          />
          <select 
            value={newTaskPriority} 
            onChange={(e) => setNewTaskPriority(e.target.value)}
            className="priority-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="submit" className="btn-primary">Add Task</button>
        </form>

        <AdaptiveSlot>
          <AdaptiveTier tier="T0">
            <TaskListT0 tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
          </AdaptiveTier>
          <AdaptiveTier tier="T1">
            <TaskListT1 tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
          </AdaptiveTier>
          <AdaptiveTier tier="T2">
            <TaskListT2 tasks={tasks} onToggle={toggleTask} />
          </AdaptiveTier>
          <AdaptiveTier tier="T3">
            <TaskListT3 tasks={tasks} onToggle={toggleTask} />
          </AdaptiveTier>
        </AdaptiveSlot>
      </div>
    </Temporal>
  );
}

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

function TaskListT0({ tasks, onToggle, onDelete }: TaskListProps) {
  return (
    <div className="tasks-container t0">
      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks yet! Add your first task above.</p>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
            <div className="task-checkbox">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggle(task)}
              />
            </div>
            <div className="task-content">
              <h3>{task.title}</h3>
              <div className="task-meta">
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority} priority
                </span>
              </div>
            </div>
            {onDelete && (
              <button className="btn-delete" onClick={() => onDelete(task.id)}>
                Delete
              </button>
            )}
          </div>
        ))
      )}
      <div className="help-card">
        <h3>Task Tips</h3>
        <ul>
          <li>Click the checkbox to mark tasks complete</li>
          <li>Use priorities to organize your work</li>
          <li>Delete tasks you no longer need</li>
        </ul>
      </div>
    </div>
  );
}

function TaskListT1({ tasks, onToggle, onDelete }: TaskListProps) {
  return (
    <div className="tasks-container t1">
      {tasks.map(task => (
        <div key={task.id} className={`task-row ${task.completed ? 'completed' : ''}`}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggle(task)}
          />
          <span className="task-title">{task.title}</span>
          <span className={`priority-pill ${task.priority}`}>{task.priority}</span>
          {onDelete && (
            <button className="btn-icon" onClick={() => onDelete(task.id)}>x</button>
          )}
        </div>
      ))}
    </div>
  );
}

function TaskListT2({ tasks, onToggle }: TaskListProps) {
  return (
    <div className="tasks-container t2 compact">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className={`task-item ${task.completed ? 'completed' : ''}`}
          onClick={() => onToggle(task)}
        >
          <span className={`priority-dot ${task.priority}`}></span>
          <span className="task-title">{task.title}</span>
          {task.completed && <span className="check">✓</span>}
        </div>
      ))}
    </div>
  );
}

function TaskListT3({ tasks, onToggle }: TaskListProps) {
  return (
    <div className="tasks-container t3 dense">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className={`task-mini ${task.completed ? 'done' : ''}`}
          onClick={() => onToggle(task)}
        >
          {task.completed ? '✓' : '○'} {task.title}
        </div>
      ))}
    </div>
  );
}
