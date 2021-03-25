if (localStorage.getItem('app_tab_name')) {
    localStorage.setItem('appTabName', localStorage.getItem('app_tab_name'));
    localStorage.removeItem('app_tab_name');
}

document.title = localStorage.getItem('appTabName') || '\u200E';

if (localStorage.getItem('backdropTheme') === 'DARK') {
    document.documentElement.style.backgroundColor = '#000';
} else {
    document.documentElement.style.backgroundColor = '#fff';
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'DARK') {
        document.getElementById('color-scheme').setAttribute('content', 'dark');
    } else {
        document.getElementById('color-scheme').setAttribute('content', 'light');
    }
});
