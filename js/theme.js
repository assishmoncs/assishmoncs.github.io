// Apply a saved choice before paint; storage may be unavailable in private mode.
(() => {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;
  } catch { /* The default dark theme remains usable. */ }
})();
