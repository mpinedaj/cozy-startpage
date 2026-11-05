import { t, tf, type Lang, type MessageKey } from '../i18n';

export type DialogValues = Record<string, string>;

export interface DialogField {
  name: string;
  labelKey: MessageKey;
  value?: string;
  type?: 'text' | 'url';
  maxLength?: number;
  placeholderKey?: MessageKey;
}

export interface FormDialogOptions {
  titleKey: MessageKey;
  messageKey?: MessageKey;
  messageVars?: Record<string, string | number>;
  fields?: DialogField[];
  confirmKey: MessageKey;
  cancelKey?: MessageKey;
  /** Tint the primary action to signal a destructive change. */
  danger?: boolean;
  /** Return an error message key to keep the dialog open. */
  validate?: (values: DialogValues) => MessageKey | null;
}

export interface MessageDialogOptions {
  titleKey: MessageKey;
  messageKey: MessageKey;
  messageVars?: Record<string, string | number>;
  confirmKey?: MessageKey;
}

export interface ConfirmDialogOptions {
  titleKey: MessageKey;
  messageKey: MessageKey;
  messageVars?: Record<string, string | number>;
  confirmKey?: MessageKey;
  cancelKey?: MessageKey;
  danger?: boolean;
}

let dialogCount = 0;

function setText(el: HTMLElement, lang: Lang, key: MessageKey): void {
  el.dataset.i18n = key;
  el.textContent = t(lang, key);
}

function setAriaLabel(el: HTMLElement, lang: Lang, key: MessageKey): void {
  el.dataset.i18nAria = key;
  el.setAttribute('aria-label', t(lang, key));
}

function focusableElements(dialog: HTMLDialogElement): HTMLElement[] {
  return Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]',
    ),
  ).filter((element) => element.getClientRects().length > 0);
}

/**
 * Keep Tab and Shift+Tab inside the dialog. Native modal dialogs already
 * prevent focus from reaching the page, but wrapping explicitly makes the
 * behaviour predictable across browsers and testable.
 */
function trapFocus(dialog: HTMLDialogElement): void {
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const items = focusableElements(dialog);
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

/**
 * Build and open a modal pixel dialog. Resolves with the field values when the
 * primary action succeeds, or null when the dialog is cancelled, dismissed
 * with Esc or its close button.
 */
export function openFormDialog(
  lang: Lang,
  options: FormDialogOptions,
): Promise<DialogValues | null> {
  dialogCount += 1;
  const titleId = `pixel-dialog-title-${dialogCount}`;

  const dialog = document.createElement('dialog');
  dialog.className = 'pixel-dialog';
  dialog.setAttribute('aria-labelledby', titleId);

  const form = document.createElement('form');
  form.className = 'pixel-dialog-form';
  form.noValidate = true;

  const header = document.createElement('header');
  header.className = 'pixel-dialog-header';

  const title = document.createElement('h2');
  title.id = titleId;
  setText(title, lang, options.titleKey);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'dialog-close';
  closeBtn.textContent = '×';
  setAriaLabel(closeBtn, lang, 'close');
  closeBtn.addEventListener('click', () => settle(null));

  header.append(title, closeBtn);

  const body = document.createElement('div');
  body.className = 'pixel-dialog-body';

  if (options.messageKey) {
    const message = document.createElement('p');
    message.className = 'dialog-message';
    if (options.messageVars) {
      message.textContent = tf(lang, options.messageKey, options.messageVars);
    } else {
      setText(message, lang, options.messageKey);
    }
    body.append(message);
  }

  const inputs = new Map<string, HTMLInputElement>();
  for (const field of options.fields ?? []) {
    const fieldWrap = document.createElement('div');
    fieldWrap.className = 'field';

    const inputId = `pixel-field-${dialogCount}-${field.name}`;
    const label = document.createElement('label');
    label.htmlFor = inputId;
    setText(label, lang, field.labelKey);

    const input = document.createElement('input');
    input.id = inputId;
    input.name = field.name;
    input.type = field.type ?? 'text';
    input.autocomplete = 'off';
    input.value = field.value ?? '';
    if (field.maxLength) input.maxLength = field.maxLength;
    if (field.placeholderKey) {
      input.dataset.i18nPlaceholder = field.placeholderKey;
      input.placeholder = t(lang, field.placeholderKey);
    }

    inputs.set(field.name, input);
    fieldWrap.append(label, input);
    body.append(fieldWrap);
  }

  const error = document.createElement('p');
  error.className = 'dialog-error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  body.append(error);

  const actions = document.createElement('div');
  actions.className = 'dialog-actions';

  if (options.cancelKey) {
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'dialog-cancel';
    setText(cancelBtn, lang, options.cancelKey);
    cancelBtn.addEventListener('click', () => settle(null));
    actions.append(cancelBtn);
  }

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'submit';
  confirmBtn.className = options.danger ? 'dialog-confirm danger' : 'dialog-confirm';
  setText(confirmBtn, lang, options.confirmKey);
  actions.append(confirmBtn);

  form.append(header, body, actions);
  dialog.append(form);

  let settled = false;
  let resolveResult: (value: DialogValues | null) => void = () => undefined;

  function settle(value: DialogValues | null): void {
    if (settled) return;
    settled = true;
    dialog.close();
    resolveResult(value);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const values: DialogValues = {};
    for (const [name, input] of inputs) values[name] = input.value;

    const problem = options.validate?.(values) ?? null;
    if (problem) {
      error.textContent = t(lang, problem);
      error.hidden = false;
      for (const input of inputs.values()) input.setAttribute('aria-invalid', 'true');
      return;
    }

    settle(values);
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    settle(null);
  });

  dialog.addEventListener('close', () => {
    dialog.remove();
    if (!settled) {
      settled = true;
      resolveResult(null);
    }
  });

  trapFocus(dialog);
  document.body.append(dialog);

  return new Promise<DialogValues | null>((resolve) => {
    resolveResult = resolve;
    dialog.showModal();
    queueMicrotask(() => {
      const firstField = options.fields?.[0];
      const target = firstField ? inputs.get(firstField.name) : confirmBtn;
      target?.focus();
      if (target instanceof HTMLInputElement) target.select();
    });
  });
}

/** Informational dialog with a single primary action. */
export async function openMessageDialog(lang: Lang, options: MessageDialogOptions): Promise<void> {
  await openFormDialog(lang, {
    titleKey: options.titleKey,
    messageKey: options.messageKey,
    messageVars: options.messageVars,
    confirmKey: options.confirmKey ?? 'ok',
  });
}

/** Ask before a destructive action. Resolves true only on confirmation. */
export async function openConfirmDialog(
  lang: Lang,
  options: ConfirmDialogOptions,
): Promise<boolean> {
  const values = await openFormDialog(lang, {
    titleKey: options.titleKey,
    messageKey: options.messageKey,
    messageVars: options.messageVars,
    confirmKey: options.confirmKey ?? 'delete',
    cancelKey: options.cancelKey ?? 'cancel',
    danger: options.danger ?? true,
  });
  return values !== null;
}
