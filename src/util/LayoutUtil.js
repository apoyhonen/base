export { getOffsetLeft, getOffsetTop, getCanvasMouseEventOffsetPos, }

function getCanvasMouseEventOffsetPos(event, canvas, limitToCanvasCoords = false) {
    const offsetX = event.clientX - getOffsetLeft(canvas);
    const offsetY = event.clientY - getOffsetTop(canvas);

    if (limitToCanvasCoords) {
        return {
            x: Math.min(canvas.width, Math.max(0, offsetX)),
            y: Math.min(canvas.height, Math.max(0, offsetY))
        }
    } else {
        return { x: offsetX, y: offsetY };
    }
}

function getOffsetLeft(element) {
    let offsetLeft = element.offsetLeft;
    let offsetParent = element.offsetParent;
    while (offsetParent) {
        offsetLeft += offsetParent.offsetLeft;
        offsetParent = offsetParent.offsetParent;
    }
    return offsetLeft;
}

function getOffsetTop(element) {
    let offsetTop = element.offsetTop;
    let offsetParent = element.offsetParent;
    while (offsetParent) {
        offsetTop += offsetParent.offsetTop;
        offsetParent = offsetParent.offsetParent;
    }
    return offsetTop;
}