// Default to warm alabaster architectural light theme; preserve user's saved toggle before paint.
(() => {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.dataset.theme = saved;
    }
  } catch { /* Default light gallery theme remains active. */ }
})();
