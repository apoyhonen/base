export {
    randomIntBetween, randomBetween,
    degreesToRadian, radianToDegrees,
    angleBetweenPointsRadian, angleBetweenPointsDegreesPositive,
    projectPoint,
    distanceBetweenPoints, distanceToLine,
    isRectCollision, isCircleCollision, isRectCircleCollision,
    twoCircleCollisionPoint, circleCollisionTwoMoving, circleCollisionOneMovingOneStationary,
    easeOutCubic, easeInCubic, testEasing,
};

// RANDOM

function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

// TRIGONOMETRY (ANGLES, LINES, VECTORS)

function degreesToRadian(degrees) {
    return Math.PI * degrees / 180.0;
}

function radianToDegrees(radians) {
    return radians * 180 / Math.PI;
}

function angleBetweenPointsRadian(originX, originY, targetX, targetY) {
    return Math.atan2(targetY - originY, targetX - originX);
}

function angleBetweenPointsDegreesPositive(originX, originY, targetX, targetY) {
    const directionInDegrees = radianToDegrees(angleBetweenPointsRadian(originX, originY, targetX, targetY));
    return (directionInDegrees + 360) % 360; // change to positive angle
}

function projectPoint(originX, originY, length, radiansTheta) {
    return { x: projectPointX(originX, length, radiansTheta), y: projectPointY(originY, length, radiansTheta) };
}

function projectPointX(originX, length, radiansTheta) {
    return originX + length * Math.cos(radiansTheta);
}

function projectPointY(originY, length, radiansTheta) {
    return originY + length * Math.sin(radiansTheta);
}

function distanceBetweenPoints(originX, originY, targetX, targetY) {
    return Math.hypot(originX - targetX, originY - targetY);
}

function distanceToLine(originX, originY, lineFirstPointX, lineFirstPointY, lineSecondPointX, lineSecondPointY) {
    return Math.sqrt(distanceToLineToPowerOfTwo(originX, originY, lineFirstPointX, lineFirstPointY, lineSecondPointX, lineSecondPointY));
}

function distanceToLineToPowerOfTwo(originX, originY, lineFirstPointX, lineFirstPointY, lineSecondPointX, lineSecondPointY) {
    const linePointsDistance = distanceToPowerOfTwo(lineFirstPointX, lineFirstPointY, lineSecondPointX, lineSecondPointY);
    if (linePointsDistance === 0) return distanceToPowerOfTwo(originX, originY, lineFirstPointX, lineFirstPointY);

    let dot = ((originX - lineFirstPointX) * (lineSecondPointX - lineFirstPointX)
        + (originY - lineFirstPointY) * (lineSecondPointY
            - lineFirstPointY)) / linePointsDistance;
    dot = Math.max(0, Math.min(1, dot));

    return distanceToPowerOfTwo(originX, originY,
        lineFirstPointX + dot * (lineSecondPointX - lineFirstPointX),
        lineFirstPointY + dot * (lineSecondPointY - lineFirstPointY));
}

function distanceToPowerOfTwo(lineFirstPointX, lineFirstPointY, lineSecondPointX, lineSecondPointY) {
    return squared(lineFirstPointX - lineSecondPointX) + squared(lineFirstPointY - lineSecondPointY);
}

// collision

function isRectCollision(rectOneX, rectOneY, rectOneWidth, rectOneHeight, rectTwoX, rectTwoY, rectTwoWidth, rectTwoHeight) {
    return rectOneX < rectTwoX + rectTwoWidth
        && rectOneX + rectOneWidth > rectTwoX
        && rectOneY < rectTwoY + rectTwoHeight
        && rectOneY + rectOneHeight > rectTwoY;
}

function isCircleCollision(circleOneX, circleOneY, circleOneRadius, circleTwoX, circleTwoY, circleTwoRadius = null) {
    return distanceBetweenPoints(circleOneX, circleOneY, circleTwoX, circleTwoY) <= circleOneRadius + (circleTwoRadius ? circleTwoRadius : circleOneRadius);
}

function isRectCircleCollision(rectX, rectY, rectWidth, rectHeight, circleX, circleY, circleRadius) {
    const halfWidth = rectWidth / 2;
    const halfHeight = rectHeight / 2;
    const distanceX = Math.abs(rectX + halfWidth - circleX);
    const distanceY = Math.abs(rectY + halfHeight - circleY);

    if (distanceX > halfWidth + circleRadius || distanceY > halfHeight + circleRadius) return false; // cannot collide
    if (distanceX <= halfWidth || distanceY <= halfHeight) return true; // has to collide

    const dx = distanceX - halfWidth;
    const dy = distanceY - halfHeight;
    return dx * dx + dy * dy <= circleRadius * circleRadius;
}

function twoCircleCollisionPoint(firstX, firstY, firstRadius, secondX, secondY, secondRadius) {
    const collisionPointX = ((firstX * secondRadius) + (secondX * firstRadius)) / (firstRadius + secondRadius);
    const collisionPointY = ((firstY * secondRadius) + (secondY * firstRadius)) / (firstRadius + secondRadius);
    return { x: collisionPointX, y: collisionPointY };
}

function circleCollisionTwoMoving(firstDx, firstDy, secondDx, secondDy, massOptions = null) {
    // first assume circles are same mass regardless of size
    let firstMass = 1;
    let secondMass = 1;

    if (massOptions) {
        if (massOptions['firstMass']) firstMass = massOptions['firstMass'];
        if (massOptions['secondMass']) firstMass = massOptions['secondMass'];
    }

    const newFirstDx = (firstDx * (firstMass - secondMass) + (2 * secondMass * secondDx)) / (firstMass + secondMass);
    const newFirstDy = (firstDy * (firstMass - secondMass) + (2 * secondMass * secondDy)) / (firstMass + secondMass);
    const newSecondDx = (secondDx * (secondMass - firstMass) + (2 * firstMass * firstDx)) / (firstMass + secondMass);
    const newSecondDy = (secondDy * (secondMass - firstMass) + (2 * firstMass * firstDy)) / (firstMass + secondMass);

    return { firstDx: newFirstDx, firstDy: newFirstDy, secondDx: newSecondDx, secondDy: newSecondDy };
}

function circleCollisionOneMovingOneStationary(movingX, movingY, movingDx, movingDy, staticX, staticY, remainStatic = false) {
    // Two-dimensional collision with one moving and one static object
    if (remainStatic) {
        // static will remain stationary
        //return { movingDx: , movingDy: , staticDx: 0, staticDy: 0 };
    } else {
        // both objects will move
        //return { movingDx: , movingDy: , staticDx: , staticDy:  };
    }
}

// easing

function easeOutCubic(ratio) {
    return 1 - Math.pow(1 - ratio, 3);
}

function easeInCubic(ratio) {
    return ratio * ratio * ratio;
}

function testEasing() {
    console.log(" ");
    console.log("test easing out");
    easeOut(0);
    easeOut(0.25);
    easeOut(0.5);
    easeOut(0.75);
    easeOut(1);
    console.log(" ");

    console.log("test easing in");
    easeIn(0);
    easeIn(0.25);
    easeIn(0.5);
    easeIn(0.75);
    easeIn(1);
    console.log(" ");
}

function easeOut(ratio) {
    console.log('ease out ratio ' + ratio + ' to ratio ' + easeOutCubic(ratio));
}

function easeIn(ratio) {
    console.log('ease in ratio ' + ratio + ' to ratio ' + easeInCubic(ratio));
}

// pure math

function squared(x) {
    return x * x;
}