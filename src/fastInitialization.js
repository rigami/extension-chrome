document.title = localStorage.getItem("app_tab_name") || "\u200E";

document.documentElement.style.backgroundColor = localStorage.getItem("app_backdrop_theme") === "DARK" ? "#000" : "#fff";