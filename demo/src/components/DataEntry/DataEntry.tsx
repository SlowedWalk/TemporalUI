import { useState } from 'react';
import { Temporal, AdaptiveSlot, AdaptiveTier } from '@temporalui/react';
import { useAuth } from '../../lib/auth';

export default function DataEntry() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    amount: '',
    date: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateT0 = () => {
    const errs: Record<string, string> = {};
    if (!formData.title) errs.title = 'Title is required';
    if (!formData.category) errs.category = 'Please select a category';
    if (!formData.amount) errs.amount = 'Amount is required';
    if (!formData.date) errs.date = 'Date is required';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errs = validateT0();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Create task as example of data entry
    if (user) {
      const storedTasks = JSON.parse(localStorage.getItem('temporalui_tasks') || '[]');
      const newTask = {
        id: `task-${Date.now()}`,
        title: `${formData.category}: ${formData.title}`,
        description: formData.description || formData.notes,
        priority: formData.amount && parseFloat(formData.amount) > 1000 ? 'high' : 'medium',
        completed: false,
        userId: user.id,
      };
      storedTasks.push(newTask);
      localStorage.setItem('temporalui_tasks', JSON.stringify(storedTasks));
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ title: '', description: '', category: '', amount: '', date: '', notes: '' });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <Temporal id="data-entry" domain="forms" coldStartTier="T0">
      <div className="data-entry">
        <h1>Data Entry</h1>
        
        {submitted && <div className="success-message">Data submitted successfully!</div>}

        <AdaptiveSlot>
          <AdaptiveTier tier="T0">
            <DataEntryT0 
              formData={formData} 
              onChange={handleChange} 
              onSubmit={handleSubmit}
              errors={errors}
            />
          </AdaptiveTier>
          <AdaptiveTier tier="T1">
            <DataEntryT1 
              formData={formData} 
              onChange={handleChange} 
              onSubmit={handleSubmit}
            />
          </AdaptiveTier>
          <AdaptiveTier tier="T2">
            <DataEntryT2 
              formData={formData} 
              onChange={handleChange} 
              onSubmit={handleSubmit}
            />
          </AdaptiveTier>
          <AdaptiveTier tier="T3">
            <DataEntryT3 
              formData={formData} 
              onChange={handleChange} 
              onSubmit={handleSubmit}
            />
          </AdaptiveTier>
        </AdaptiveSlot>
      </div>
    </Temporal>
  );
}

interface DataEntryProps {
  formData: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors?: Record<string, string>;
}

function DataEntryT0({ formData, onChange, onSubmit, errors = {} }: DataEntryProps) {
  return (
    <form onSubmit={onSubmit} className="data-entry-form t0">
      <div className="form-section">
        <h2>Basic Information</h2>
        <p className="form-description">Enter the main details about your entry</p>
        
        <div className="form-group">
          <label htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={onChange}
            placeholder="Enter a descriptive title"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
          <span className="field-help">This will appear as the main label</span>
        </div>

        <div className="form-group">
          <label htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={onChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select a category</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
            <option value="investment">Investment</option>
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>
      </div>

      <div className="form-section">
        <h2>Financial Details</h2>
        <p className="form-description">Enter the monetary values</p>

        <div className="form-group">
          <label htmlFor="amount">
            Amount <span className="required">*</span>
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={onChange}
            placeholder="0.00"
            className={errors.amount ? 'error' : ''}
          />
          {errors.amount && <span className="error-text">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="date">
            Date <span className="required">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={onChange}
            className={errors.date ? 'error' : ''}
          />
          {errors.date && <span className="error-text">{errors.date}</span>}
        </div>
      </div>

      <div className="form-section">
        <h2>Additional Information</h2>
        <p className="form-description">Optional details (optional)</p>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Add any additional details..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Private Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={onChange}
            placeholder="Your private notes..."
            rows={2}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">Submit Entry</button>
        <button type="reset" className="btn-secondary">Clear Form</button>
      </div>

      <div className="help-card">
        <h3>Form Tips</h3>
        <ul>
          <li>Fields marked with * are required</li>
          <li>Use the description for details you'll need later</li>
          <li>Private notes are only visible to you</li>
        </ul>
      </div>
    </form>
  );
}

function DataEntryT1({ formData, onChange, onSubmit }: DataEntryProps) {
  return (
    <form onSubmit={onSubmit} className="data-entry-form t1">
      <div className="form-row">
        <div className="form-group">
          <label>Title *</label>
          <input name="title" value={formData.title} onChange={onChange} />
        </div>
        <div className="form-group">
          <label>Category *</label>
          <select name="category" value={formData.category} onChange={onChange}>
            <option value="">Select</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Amount *</label>
          <input name="amount" type="number" value={formData.amount} onChange={onChange} />
        </div>
        <div className="form-group">
          <label>Date *</label>
          <input name="date" type="date" value={formData.date} onChange={onChange} />
        </div>
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={formData.description} onChange={onChange} />
      </div>
      <button type="submit" className="btn-primary">Submit</button>
    </form>
  );
}

function DataEntryT2({ formData, onChange, onSubmit }: DataEntryProps) {
  return (
    <form onSubmit={onSubmit} className="data-entry-form t2">
      <div className="form-compact">
        <input name="title" placeholder="Title" value={formData.title} onChange={onChange} required />
        <select name="category" value={formData.category} onChange={onChange} required>
          <option value="">Category</option>
          <option value="income">+</option>
          <option value="expense">-</option>
        </select>
        <input name="amount" type="number" placeholder="0.00" value={formData.amount} onChange={onChange} required />
        <input name="date" type="date" value={formData.date} onChange={onChange} required />
        <button type="submit">Save</button>
      </div>
    </form>
  );
}

function DataEntryT3({ formData, onChange, onSubmit }: DataEntryProps) {
  return (
    <form onSubmit={onSubmit} className="data-entry-form t3">
      <div className="form-dense">
        <input name="title" placeholder="title" value={formData.title} onChange={onChange} required />
        <input name="amount" type="number" placeholder="amt" value={formData.amount} onChange={onChange} required />
        <input name="date" type="date" value={formData.date} onChange={onChange} required />
        <button type="submit">→</button>
      </div>
    </form>
  );
}
