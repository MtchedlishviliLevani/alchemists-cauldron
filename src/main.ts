const root = document.querySelector<HTMLDivElement>('#app');

if (root) {
  const title = document.createElement('h1');
  title.textContent = "Alchemist's Cauldron";
  root.append(title);
}
