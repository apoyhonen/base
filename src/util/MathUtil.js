export { randomIntBetween, degreesToRadian, radianToDegrees, angleBetweenPointsRadian, angleBetweenPointsDegreesPositive, projectPoint };

// PURE MATH (RANDOM, ETC.)

function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
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