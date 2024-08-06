export {
    randomIntBetween, randomBetween,
    degreesToRadian, radianToDegrees,
    angleBetweenPointsRadian, angleBetweenPointsDegreesPositive,
    projectPoint,
    distanceBetweenPoints, distanceToLine,
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

// pure math

function squared(x) {
    return x * x;
}