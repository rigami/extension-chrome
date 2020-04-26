const merge = (parent, ...childs) => {
    const mergeObject = {...parent};

    childs.forEach((child) => {
        for (const key in child) {
            if (!child.hasOwnProperty(key)) continue;

            if (mergeObject[key] && typeof child[key] === "object" && typeof mergeObject[key] === "object") {
                mergeObject[key] = merge(mergeObject[key], child[key]);
            } else {
                mergeObject[key] = child[key];
            }
        }
    });

    console.log(mergeObject)

    return mergeObject;
};

export default merge;