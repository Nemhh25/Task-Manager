import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "../lib/api";

interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
}

function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/tasks`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const response = await fetch(`${API_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title: newTitle }),
    });

    const created = await response.json();
    setTasks([...tasks, created]);
    setNewTitle("");
  }

  async function handleToggle(task: Task) {
    const response = await fetch(`${API_URL}/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ completed: !task.completed }),
    });

    const updated = await response.json();
    setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
  }

  async function handleDelete(id: number) {
    await fetch(`${API_URL}/api/tasks/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setTasks(tasks.filter((t) => t.id !== id));
  }

  async function handleLogout() {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    navigate("/login");
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="app">
      <h1>Minhas Tarefas</h1>
     

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nova tarefa"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit">Adicionar</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggle(task)}
            />
            <span>{task.title}</span>
            <button type="button" onClick={() => handleDelete(task.id)}>
              Excluir
            </button>
          </li>
        ))}
      </ul>
       <button type="button" className="logout-button" onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
}

export default Tasks;