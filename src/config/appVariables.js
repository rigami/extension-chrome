export default {
    db: {
        name: "clock_tab",
        version: 1,
    },
    fs: {
        root: "filesystem:chrome-extension://" + chrome.runtime.id + "/persistent/",
    },
    maxUploadFiles: 15,
    defaultBG: {
        src: "https://images.unsplash.com/photo-1455463640095-c56c5f258548?ixlib=rb-1.2.1&auto=format&fit=crop&w=1349&q=80",
        author: "Tim Gouw",
        type: "image",
        description: "Unsplash photo",
        sourceLink: "https://unsplash.com/photos/S4QAzzXPaRs",
    },
};