const API = 'http://localhost:3333/api/tasks';

async function handleResponse(response) {
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Erro na requisição.');
  }
  return data;
}

export async function fetchTasks({ search = '', status = 'all' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status && status !== 'all') params.set('status', status);
  const query = params.toString();

  const response = await fetch(`${API}${query ? `?${query}` : ''}`);
  return handleResponse(response);
}

export async function createTask({ title, dueDate }) {
  const response = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, dueDate: dueDate || null }),
  });
  return handleResponse(response);
}

export async function updateTask(id, { title, dueDate, completed }) {
  const body = {};
  if (title !== undefined) body.title = title;
  if (dueDate !== undefined) body.dueDate = dueDate || null;
  if (completed !== undefined) body.completed = completed;

  const response = await fetch(`${API}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

export async function deleteTask(id) {
  const response = await fetch(`${API}/${id}`, { method: 'DELETE' });
  return handleResponse(response);
}
