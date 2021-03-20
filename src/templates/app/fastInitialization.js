if (localStorage.getItem('app_tab_name')) {
    localStorage.setItem('appTabName', localStorage.getItem('app_tab_name'));
    localStorage.removeItem('app_tab_name');
}

document.title = localStorage.getItem('appTabName') || '\u200E';

if (localStorage.getItem('backdropTheme') === 'DARK') {
    console.log('DARK');
    document.documentElement.style.backgroundColor = '#000';
} else {
    console.log('LIGHT');
    document.documentElement.style.backgroundColor = '#fff';
}
