if (localStorage.getItem('theme') === 'DARK') {
    console.log('DARK');
    document.documentElement.style.backgroundColor = '#000';
} else {
    console.log('LIGHT');
    document.documentElement.style.backgroundColor = '#fff';
}
