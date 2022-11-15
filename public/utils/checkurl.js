module.exports.checkUrl = (url) => {
    return url.startsWith("http://")
        ? url
        : url.startsWith("https://")
        ? url
        : "";
};
