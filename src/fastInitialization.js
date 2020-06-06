document.title = localStorage.getItem('app_tab_name') || '\u200E';


if (localStorage.getItem('last_setup_timestamp')) {
    if (localStorage.getItem('app_backdrop_theme') === 'DARK') {
        document.documentElement.style.backgroundColor = '#000';
    } else {
        document.documentElement.style.backgroundColor = '#fff';
    }
}
