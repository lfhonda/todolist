export function toISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDueDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export function isOverdue(task) {
  if (!task.due_date || task.completed === 1 || task.completed === true) return false;
  return task.due_date < toISODate();
}

export function sortByDueDate(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    if (a.due_date === b.due_date) return 0;
    return a.due_date < b.due_date ? -1 : 1;
  });
}
