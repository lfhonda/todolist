import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

let nextId = 3;
let db = [
  { id: 1, title: 'Buy milk', completed: 0, due_date: null, created_at: '2026-10-01' },
  { id: 2, title: 'Pay bills', completed: 0, due_date: '2020-01-01', created_at: '2026-10-02' },
];

function tasksResponse(search = '') {
  const filtered = db.filter((task) => task.title.toLowerCase().includes(search.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date < b.due_date ? -1 : 1;
  });
  return {
    tasks: sorted,
    total: db.length,
    completed: db.filter((task) => task.completed === 1).length,
  };
}

function installMockApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options = {}) => {
      const method = (options.method || 'GET').toUpperCase();
      const parsed = new URL(url);
      const path = parsed.pathname;
      const body = options.body ? JSON.parse(options.body) : {};

      if (method === 'GET' && path === '/api/tasks') {
        return { ok: true, status: 200, json: async () => tasksResponse(parsed.searchParams.get('search') || '') };
      }

      if (method === 'POST' && path === '/api/tasks') {
        const task = { id: nextId++, title: body.title, completed: 0, due_date: body.dueDate ?? null, created_at: '2026-10-19' };
        db.push(task);
        return { ok: true, status: 201, json: async () => task };
      }

      const idMatch = path.match(/\/api\/tasks\/(\d+)$/);
      if (idMatch) {
        const id = Number(idMatch[1]);
        const task = db.find((item) => item.id === id);

        if (method === 'PATCH') {
          if (!task) return { ok: false, status: 404, json: async () => ({ message: 'Tarefa não encontrada.' }) };
          if (typeof body.completed === 'boolean') task.completed = body.completed ? 1 : 0;
          if (typeof body.title === 'string') task.title = body.title;
          if (body.dueDate !== undefined) task.due_date = body.dueDate || null;
          return { ok: true, status: 200, json: async () => task };
        }

        if (method === 'DELETE') {
          db = db.filter((item) => item.id !== id);
          return { ok: true, status: 204, json: async () => null };
        }
      }

      return { ok: false, status: 404, json: async () => ({ message: 'Not found' }) };
    })
  );
}

beforeEach(() => {
  nextId = 3;
  db = [
    { id: 1, title: 'Buy milk', completed: 0, due_date: null, created_at: '2026-10-01' },
    { id: 2, title: 'Pay bills', completed: 0, due_date: '2020-01-01', created_at: '2026-10-02' },
  ];
  installMockApi();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('TODOLIST frontend', () => {
  it('lista tarefas com contadores de total e concluídas', async () => {
    render(<App />);

    expect(await screen.findByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Pay bills')).toBeInTheDocument();
    expect(screen.getByText('2 tasks')).toBeInTheDocument();
    expect(screen.getByText('0 completed')).toBeInTheDocument();
  });

  it('ordena automaticamente pela data mais próxima primeiro', async () => {
    render(<App />);

    const titles = await screen.findAllByText(/Buy milk|Pay bills/);
    expect(titles[0]).toHaveTextContent('Pay bills');
    expect(titles[1]).toHaveTextContent('Buy milk');
  });

  it('marca tarefa como concluída pelo checkbox e atualiza os contadores', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByLabelText('Concluir tarefa Buy milk'));

    await waitFor(() => expect(screen.getByText('1 completed')).toBeInTheDocument());
    const item = screen.getByText('Buy milk').closest('.task-item');
    expect(within(item).getByRole('checkbox')).toBeChecked();
  });

  it('cria uma tarefa pelo modal com data limite opcional', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByLabelText('Create task'));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText(/Finish the science homework/), 'Walk the dog');
    await user.click(within(dialog).getByRole('button', { name: 'Create task' }));

    expect(await screen.findByText('Walk the dog')).toBeInTheDocument();
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('edita uma tarefa pelo modal e salva a alteração', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(await screen.findByLabelText('Editar tarefa Buy milk'));
    const dialog = screen.getByRole('dialog');
    const input = within(dialog).getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'Buy oat milk');
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Buy oat milk')).toBeInTheDocument();
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument();
  });

  it('exclui uma tarefa após confirmação', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<App />);

    await user.click(await screen.findByLabelText('Excluir tarefa Buy milk'));

    await waitFor(() => expect(screen.queryByText('Buy milk')).not.toBeInTheDocument());
    expect(screen.getByText('1 task')).toBeInTheDocument();
  });

  it('destaca tarefa em atraso com título vermelho e selo "Em atraso"', async () => {
    render(<App />);

    const title = await screen.findByText('Pay bills');
    expect(title).toHaveClass('overdue');
    expect(screen.getByText('Em atraso')).toBeInTheDocument();
  });

  it('não marca como em atraso uma tarefa já concluída', async () => {
    db[1] = { ...db[1], completed: 1 };
    render(<App />);

    const title = await screen.findByText('Pay bills');
    expect(title).not.toHaveClass('overdue');
    expect(screen.queryByText('Em atraso')).not.toBeInTheDocument();
  });

  it('mostra o estado vazio "You have no pending tasks."', async () => {
    db = [];
    render(<App />);

    expect(await screen.findByText('You have no pending tasks.')).toBeInTheDocument();
    expect(screen.getByText('0 tasks')).toBeInTheDocument();
  });

  it('faz busca em tempo real com debounce', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('Buy milk');
    const searchCallsBefore = fetch.mock.calls.length;

    await user.type(screen.getByLabelText('Search tasks'), 'milk');
    await screen.findByText('Buy milk');

    await waitFor(() => {
      expect(screen.queryByText('Pay bills')).not.toBeInTheDocument();
    });

    expect(fetch.mock.calls.length).toBeGreaterThan(searchCallsBefore);
    const lastCall = fetch.mock.calls.at(-1)[0];
    expect(lastCall).toContain('search=milk');
  });
});
