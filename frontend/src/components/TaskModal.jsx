import { useEffect, useState } from 'react';

export default function TaskModal({ task, onSave, onClose }) {
  const isEditing = Boolean(task);
  const [title, setTitle] = useState(task?.title ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!title.trim()) {
      setError('O nome da tarefa é obrigatório.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({ title: title.trim(), dueDate });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="modal-title">{isEditing ? 'Edit Task' : 'Create Task'}</h2>

        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Task name</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Finish the science homework"
              autoFocus
            />
          </label>

          <label className="field">
            <span>Due date <em>(optional)</em></span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="button ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="button primary" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
