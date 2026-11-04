import type { Config } from '../core/types';
import { t, tf, type Lang } from '../i18n';
import {
  MAX_TASK_LENGTH,
  addTask,
  clearDoneTasks,
  countTasks,
  removeTask,
  toggleTask,
} from '../features/tasks/tasks';

export interface TasksWidget {
  element: HTMLElement;
  render(lang: Lang): void;
}

export function createTasksWidget(config: Config): TasksWidget {
  let lang: Lang = 'en';

  const section = document.createElement('section');
  section.className = 'widget widget-tasks';
  section.setAttribute('aria-labelledby', 'tasks-title');

  const head = document.createElement('div');
  head.className = 'widget-head';

  const title = document.createElement('h2');
  title.id = 'tasks-title';

  const meta = document.createElement('span');
  meta.className = 'widget-meta';

  head.append(title, meta);

  const list = document.createElement('ul');
  list.className = 'task-list';

  const empty = document.createElement('p');
  empty.className = 'widget-empty';

  const form = document.createElement('form');
  form.className = 'task-add';

  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = MAX_TASK_LENGTH;
  input.autocomplete = 'off';

  const addBtn = document.createElement('button');
  addBtn.type = 'submit';

  form.append(input, addBtn);

  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'task-clear';

  section.append(head, list, empty, form, clearBtn);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!addTask(config, input.value)) return;
    input.value = '';
    render();
  });

  clearBtn.addEventListener('click', () => {
    clearDoneTasks(config);
    render();
  });

  function render(next?: Lang): void {
    if (next) lang = next;

    title.textContent = t(lang, 'tasks');
    empty.textContent = t(lang, 'tasksEmpty');
    input.placeholder = t(lang, 'taskPlaceholder');
    addBtn.textContent = t(lang, 'addTask');
    clearBtn.textContent = t(lang, 'clearDone');

    const { done, total } = countTasks(config.tasks);
    meta.textContent = tf(lang, 'tasksProgress', { done, total });
    meta.hidden = total === 0;
    empty.hidden = total > 0;
    clearBtn.hidden = done === 0;

    list.textContent = '';
    for (const task of config.tasks) {
      const item = document.createElement('li');
      item.className = task.done ? 'task task-done' : 'task';

      const label = document.createElement('label');
      label.className = 'task-check';

      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = task.done;
      box.addEventListener('change', () => {
        toggleTask(config, task.id);
        render();
      });

      const text = document.createElement('span');
      text.textContent = task.text;

      label.append(box, text);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'task-delete';
      remove.textContent = '×';
      remove.setAttribute('aria-label', `${t(lang, 'deleteTask')}: ${task.text}`);
      remove.addEventListener('click', () => {
        removeTask(config, task.id);
        render();
      });

      item.append(label, remove);
      list.appendChild(item);
    }
  }

  render();
  return { element: section, render };
}
