import { isOverdue, formatDueDate } from '../utils/date.js';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const overdue = isOverdue(task);
  const completed = task.completed === 1 || task.completed === true;

  return (
    <li className={`task-item${completed ? ' completed' : ''}`}>
      <label className="task-main">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={completed}
          onChange={() => onToggle(task)}
          aria-label={`Concluir tarefa ${task.title}`}
        />
        <span className="task-body">
          <span className={`task-title${overdue ? ' overdue' : ''}`}>{task.title}</span>
          <span className="task-meta">
            {task.due_date && <span className="task-due">Due: {formatDueDate(task.due_date)}</span>}
            {overdue && <span className="badge-overdue">Em atraso</span>}
          </span>
        </span>
      </label>

      <div className="task-actions">
        <button
          type="button"
          className="icon-button"
          onClick={() => onEdit(task)}
          aria-label={`Editar tarefa ${task.title}`}
          title="Editar"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
        <button
          type="button"
          className="icon-button danger"
          onClick={() => onDelete(task)}
          aria-label={`Excluir tarefa ${task.title}`}
          title="Excluir"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
          </svg>
        </button>
      </div>
    </li>
  );
}
