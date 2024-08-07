export { initKeyListeners, isDirectionalKeyPressed, isUpPressed, isRightPressed, isDownPressed, isLeftPressed, isSpacePressed }

// key handlers

let upPressedState = false;
let rightPressedState = false;
let downPressedState = false;
let leftPressedState = false;
let spacePressedState = false;

let appActiveElementId = '';

function initKeyListeners(document, elementId) {
    appActiveElementId = elementId;
    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
}

function isDirectionalKeyPressed() {
    return upPressedState || rightPressedState || downPressedState || leftPressedState;
}

function isUpPressed() {
    return upPressedState;
}

function isRightPressed() {
    return rightPressedState;
}

function isDownPressed() {
    return downPressedState;
}

function isLeftPressed() {
    return leftPressedState;
}

function isSpacePressed() {
    return spacePressedState;
}

function isAppActive() {
    return document.getElementById(appActiveElementId) !== null;
}

function keyDownHandler(e) {
    if (!isAppActive()) return;

    // left paddle keys
    if (e.key === 'w' || e.key === "ArrowUp" || e.key === "Up") {
        upPressedState = true;
    } else if (e.key === "d" || e.key === "ArrowRight" || e.key === "Right") {
        rightPressedState = true;
    } else if (e.key === "s" || e.key === "ArrowDown" || e.key === "Down") {
        downPressedState = true;
    } else if (e.key === "a" || e.key === "ArrowLeft" || e.key === "Left") {
        leftPressedState = true;
    } else if (e.key === " ") {
        spacePressedState = true;
    }
}

function keyUpHandler(e) {
    if (!isAppActive()) return;

    // left paddle keys
    if (e.key === 'w' || e.key === "ArrowUp") {
        upPressedState = false;
    } else if (e.key === "d" || e.key === "ArrowRight") {
        rightPressedState = false;
    } else if (e.key === "s" || e.key === "ArrowDown") {
        downPressedState = false;
    } else if (e.key === "a" || e.key === "ArrowLeft") {
        leftPressedState = false;
    } else if (e.key === " ") {
        spacePressedState = false;
    }
}