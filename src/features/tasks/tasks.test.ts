import { beforeEach, describe, expect, it } from 'vitest';
import { defaultConfig } from '../../core/defaults';
import type { Config } from '../../core/types';
import {
  MAX_TASK_LENGTH,
  addTask,
  cleanTaskText,
  clearDoneTasks,
  countTasks,
  removeTask,
  toggleTask,
} from './tasks';

describe('tasks', () => {
  let config: Config;

  beforeEach(() => {
    config = defaultConfig();
  });

  it('adds a trimmed task', () => {
    expect(addTask(config, '  water the plants  ')).toBe(true);
    expect(config.tasks).toHaveLength(1);
    expect(config.tasks[0].text).toBe('water the plants');
    expect(config.tasks[0].done).toBe(false);
  });

  it('collapses inner whitespace', () => {
    addTask(config, 'read   a\tbook');
    expect(config.tasks[0].text).toBe('read a book');
  });

  it('rejects empty labels', () => {
    expect(addTask(config, '   ')).toBe(false);
    expect(config.tasks).toHaveLength(0);
  });

  it('caps long labels', () => {
    addTask(config, 'x'.repeat(MAX_TASK_LENGTH + 40));
    expect(config.tasks[0].text).toHaveLength(MAX_TASK_LENGTH);
  });

  it('toggles a task by id', () => {
    addTask(config, 'stretch');
    const id = config.tasks[0].id;
    toggleTask(config, id);
    expect(config.tasks[0].done).toBe(true);
    toggleTask(config, id);
    expect(config.tasks[0].done).toBe(false);
  });

  it('ignores unknown ids', () => {
    addTask(config, 'stretch');
    toggleTask(config, 'missing');
    expect(config.tasks[0].done).toBe(false);
    removeTask(config, 'missing');
    expect(config.tasks).toHaveLength(1);
  });

  it('removes a task by id', () => {
    addTask(config, 'one');
    addTask(config, 'two');
    removeTask(config, config.tasks[0].id);
    expect(config.tasks.map((task) => task.text)).toEqual(['two']);
  });

  it('clears only finished tasks', () => {
    addTask(config, 'done one');
    addTask(config, 'keep me');
    toggleTask(config, config.tasks[0].id);
    clearDoneTasks(config);
    expect(config.tasks.map((task) => task.text)).toEqual(['keep me']);
  });

  it('does nothing when clearing with no finished tasks', () => {
    addTask(config, 'keep me');
    clearDoneTasks(config);
    expect(config.tasks).toHaveLength(1);
  });

  it('counts finished and total tasks', () => {
    addTask(config, 'one');
    addTask(config, 'two');
    toggleTask(config, config.tasks[0].id);
    expect(countTasks(config.tasks)).toEqual({ done: 1, total: 2 });
    expect(countTasks([])).toEqual({ done: 0, total: 0 });
  });

  it('normalises text through the exported helper', () => {
    expect(cleanTaskText('  a   b  ')).toBe('a b');
    expect(cleanTaskText('   ')).toBe('');
  });
});
