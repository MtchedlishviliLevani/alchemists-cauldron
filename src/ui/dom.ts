interface ElementOptions {
  className?: string;
  text?: string;
  attrs?: Record<string, string>;
  children?: (Node | string)[];
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElementOptions = {}
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.className !== undefined) node.className = options.className;
  if (options.text !== undefined) node.textContent = options.text;
  for (const [name, value] of Object.entries(options.attrs ?? {})) {
    node.setAttribute(name, value);
  }
  if (options.children !== undefined) node.append(...options.children);
  return node;
}
