export { initKeyListeners, isDirectionalKeyPressed, isUpPressed, isRightPressed, isDownPressed, isLeftPressed, isSpacePressed }

// key handlers

let upPressed = false;
let rightPressed = false;
let downPressed = false;
let leftPressed = false;
let spacePressed = false;

let appActiveElementId = '';

function initKeyListeners(document, elementId) {
    appActiveElementId = elementId;
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
}

function isDirectionalKeyPressed() {
    return upPressed || rightPressed || downPressed || leftPressed;
}

function isUpPressed() {
    return upPressed;
}

function isRightPressed() {
    return rightPressed;
}

function isDownPressed() {
    return downPressed;
}

function isLeftPressed() {
    return leftPressed;
}

function isSpacePressed() {
    return spacePressed;
}

function isAppActive() {
    return document.getElementById(appActiveElementId) !== null;
}

function keyDownHandler(e) {
    if (!isAppActive()) return;

    // left paddle keys
    if (e.key === 'w' || e.key === "ArrowUp") {
        upPressed = true;
    } else if (e.key === "d" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "s" || e.key === "ArrowDown") {
        downPressed = true;
    } else if (e.key === "a" || e.key === "ArrowLeft") {
        leftPressed = true;
    } else if (e.key === " ") {
        spacePressed = true;
    }
}

function keyUpHandler(e) {
    if (!isAppActive()) return;

    // left paddle keys
    if (e.key === 'w' || e.key === "ArrowUp") {
        upPressed = false;
    } else if (e.key === "d" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "s" || e.key === "ArrowDown") {
        downPressed = false;
    } else if (e.key === "a" || e.key === "ArrowLeft") {
        leftPressed = false;
    } else if (e.key === " ") {
        spacePressed = false;
    }
}