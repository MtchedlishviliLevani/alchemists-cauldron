import { el } from './dom';

export interface IDialog {
  element: HTMLDialogElement;
  body: HTMLElement;
  actions: HTMLElement;
  open: () => void;
  close: () => void;
}

export interface IDialogOptions {
  title: string;
  className?: string;
  onCancel?: () => void;
}

let dialogCount = 0;

export function createDialog({ title, className = '', onCancel }: IDialogOptions): IDialog {
  dialogCount += 1;
  const titleId = `dialog-title-${String(dialogCount)}`;
  const body = el('div', { className: 'dialog__body' });
  const actions = el('div', { className: 'dialog__actions' });
  const element = el('dialog', {
    className: `dialog ${className}`.trim(),
    attrs: { 'aria-labelledby': titleId },
    children: [
      el('h2', { className: 'dialog__title', attrs: { id: titleId }, text: title }),
      body,
      actions,
    ],
  });

  element.addEventListener('cancel', (event) => {
    event.preventDefault();
    onCancel?.();
  });

  return {
    element,
    body,
    actions,
    open: () => {
      if (!element.open) element.showModal();
    },
    close: () => {
      if (element.open) element.close();
    },
  };
}

export function DialogButton(
  text: string,
  onClick: () => void,
  variant: 'primary' | 'secondary' = 'primary'
): HTMLButtonElement {
  const button = el('button', {
    className: `button button--${variant}`,
    attrs: { type: 'button' },
    text,
  });
  button.addEventListener('click', onClick);
  return button;
}
