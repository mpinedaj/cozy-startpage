import type { Config, Task } from '../../core/types';
import { saveConfig } from '../../core/storage';

export const MAX_TASK_LENGTH = 120;

/** Collapse whitespace, trim and cap the length of a task label. */
export function cleanTaskText(text: string): string {
  return text.trim().replace(/\s+/g, ' ').slice(0, MAX_TASK_LENGTH);
}

export function addTask(config: Config, text: string): boolean {
  const clean = cleanTaskText(text);
  if (!clean) return false;
  config.tasks.push({ id: crypto.randomUUID(), text: clean, done: false });
  saveConfig(config);
  return true;
}

export function toggleTask(config: Config, id: string): void {
  const task = config.tasks.find((item) => item.id === id);
  if (!task) return;
  task.done = !task.done;
  saveConfig(config);
}

export function removeTask(config: Config, id: string): void {
  const next = config.tasks.filter((item) => item.id !== id);
  if (next.length === config.tasks.length) return;
  config.tasks = next;
  saveConfig(config);
}

export function clearDoneTasks(config: Config): void {
  if (!config.tasks.some((item) => item.done)) return;
  config.tasks = config.tasks.filter((item) => !item.done);
  saveConfig(config);
}

export function countTasks(tasks: Task[]): { done: number; total: number } {
  return {
    done: tasks.filter((item) => item.done).length,
    total: tasks.length,
  };
}
