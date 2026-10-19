import { useCallback, useEffect, useState } from 'react';
import { createTask, deleteTask, fetchTasks, updateTask } from './api.js';
import TaskItem from './components/TaskItem.jsx';
import TaskModal from './components/TaskModal.jsx';
import { sortByDueDate } from './utils/date.js';

const SEARCH_DEBOUNCE_MS = 400;

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);

  const loadTasks = useCallback(async (currentSearch) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTasks({ search: currentSearch });
      setTasks(sortByDueDate(data.tasks));
      setTotal(data.total);
      setCompleted(data.completed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadTasks(search);
  }, [search, loadTasks]);

  async function handleToggle(task) {
    const isDone = task.completed === 1 || task.completed === true;
    try {
      await updateTask(task.id, { completed: !isDone });
      await loadTasks(search);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSaveModal({ title, dueDate }) {
    if (modal.mode === 'edit') {
      await updateTask(modal.task.id, { title, dueDate });
    } else {
      await createTask({ title, dueDate });
    }
    setModal(null);
    await loadTasks(search);
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete the task "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      await loadTasks(search);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <section className="panel">
        <header className="panel-header">
          <div>
            <h1>TODOLIST</h1>
            <p className="counters">
              <span>{total} task{total === 1 ? '' : 's'}</span>
              <span className="dot">•</span>
              <span>{completed} completed</span>
            </p>
          </div>
          <div className="search">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search tasks..."
              aria-label="Search tasks"
            />
          </div>
        </header>

        {error && (
          <div className="error-box" role="alert">
            {error}
            <button type="button" onClick={() => loadTasks(search)}>Retry</button>
          </div>
        )}

        {loading ? (
          <p className="empty-state">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">You have no pending tasks.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onEdit={(selected) => setModal({ mode: 'edit', task: selected })}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </section>

      <button
        type="button"
        className="fab"
        onClick={() => setModal({ mode: 'create' })}
        aria-label="Create task"
        title="Create task"
      >
        +
      </button>

      {modal && (
        <TaskModal
          task={modal.mode === 'edit' ? modal.task : null}
          onSave={handleSaveModal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
