// Shared by the app and the standalone document editors, before first paint.
export const themeBootstrap = `(function(){try{var t=localStorage.getItem('trustcode-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;
