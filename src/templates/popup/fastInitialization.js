if (localStorage.getItem('theme') === 'DARK') {
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
