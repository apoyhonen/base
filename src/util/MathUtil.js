export {
    randomIntBetween, randomBetween,
    degreesToRadian, radianToDegrees,
    angleBetweenPointsRadian, angleBetweenPointsDegreesPositive,
    projectPoint,
    distanceBetweenPoints, closestPointToLine, distanceToLine,
    getRightAngleTriangleHypotenuse, getCircleCollisionPointOnLine,
    isRectCollision, isCircleCollision, isRectCircleCollision, isTriangleCircleCollision, isLineCircleCollision,
    twoCircleCollisionPoint, circleCollisionTwoMoving, circleCollisionMovingAndStationary,
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

function closestPointToLine(originX, originY, firstX, firstY, secondX, secondY) {
    const A1 = secondY - firstY;
    const B1 = firstX - secondX;
    const C1 = (secondY - firstY) * firstX + (firstX - secondX) * firstY;
    const C2 = -B1 * originX + A1 * originY;
    const det = A1 * A1 - -B1 * B1;

    // closest on pure line
    let closestX;
    let closestY;
    if (det !== 0) {
        closestX = (A1 * C1 - B1 * C2) / det;
        closestY = (A1 * C2 - -B1 * C1) / det; // closest on pure line
    } else{
        closestX = originX;
        closestY = originY;
    }

    // only return point if it exists on the actual segment
    if (isPointOnLineSegment(closestX, closestY, firstX, firstY, secondX, secondY)) {
        return  { x: closestX, y: closestY };
    } else return null; // not on actual segment
}

function isPointOnLineSegment(pointX, pointY, firstX, firstY, secondX, secondY) {
    const largerX = Math.max(firstX, secondX);
    const smallerX = Math.min(firstX, secondX);
    const largerY = Math.max(firstY, secondY);
    const smallerY = Math.min(firstY, secondY);

    return pointX >= smallerX && pointX <= largerX && pointY >= smallerY && pointY <= largerY;
}

function distanceToLine(originX, originY, firstX, firstY, secondX, secondY) {
    return Math.sqrt(distanceToLineToPowerOfTwo(originX, originY, firstX, firstY, secondX, secondY));
}

function distanceToLineToPowerOfTwo(originX, originY, firstX, firstY, secondX, secondY) {
    const linePointsDistance = distanceToPowerOfTwo(firstX, firstY, secondX, secondY);
    if (linePointsDistance === 0) return distanceToPowerOfTwo(originX, originY, firstX, firstY);

    let dot = ((originX - firstX) * (secondX - firstX)
        + (originY - firstY) * (secondY - firstY)) / linePointsDistance;
    dot = Math.max(0, Math.min(1, dot));

    return distanceToPowerOfTwo(originX, originY,
        firstX + dot * (secondX - firstX),
        firstY + dot * (secondY - firstY));
}

function distanceToPowerOfTwo(firstX, firstY, secondX, secondY) {
    return squared(firstX - secondX) + squared(firstY - secondY);
}

function getRightAngleTriangleHypotenuse(triangleOneX, triangleOneY, triangleTwoX, triangleTwoY, triangleThreeX, triangleThreeY) {
    const line1 = { oneX: triangleOneX, oneY: triangleOneY, twoX: triangleTwoX, twoY: triangleTwoY };
    const line2 = { oneX: triangleTwoX, oneY: triangleTwoY, twoX: triangleThreeX, twoY: triangleThreeY };
    const line3 = { oneX: triangleThreeX, oneY: triangleThreeY, twoX: triangleOneX, twoY: triangleOneY };

    const distanceOne = distanceBetweenPoints(line1.oneX, line1.oneY, line1.twoX, line1.twoY);
    const distanceTwo = distanceBetweenPoints(line2.oneX, line2.oneY, line2.twoX, line2.twoY);
    const distanceThree = distanceBetweenPoints(line3.oneX, line3.oneY, line3.twoX, line3.twoY);

    if (distanceOne > distanceTwo && distanceOne > distanceThree) return line1;
    if (distanceTwo > distanceOne && distanceTwo > distanceThree) return line2;
    else return line3; // 3 longer than one or two
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

function isTriangleCircleCollision(firstX, firstY, secondX, secondY, thirdX, thirdY, circleX, circleY, circleRadius) {
    // circle hits points
    if (distanceBetweenPoints(firstX, firstY, circleX, circleY) <= circleRadius) return true;
    if (distanceBetweenPoints(secondX, secondY, circleX, circleY) <= circleRadius) return true;
    if (distanceBetweenPoints(thirdX, thirdY, circleX, circleY) <= circleRadius) return true;

    // circle hits lines
    if (distanceToLine(circleX, circleY, firstX, firstY, secondX, secondY) <= circleRadius) return true;
    if (distanceToLine(circleX, circleY, secondX, secondY, thirdX, thirdY) <= circleRadius) return true;
    if (distanceToLine(circleX, circleY, thirdX, thirdY, firstX, firstY) <= circleRadius) return true;

    return false;
}

function isLineCircleCollision(circleX, circleY, circleRadius, firstX, firstY, secondX, secondY) {
    return getCircleCollisionPointOnLine(circleX, circleY, circleRadius, firstX, firstY, secondX, secondY) !== null;
}

function getCircleCollisionPointOnLine(circleX, circleY, circleRadius, firstX, firstY, secondX, secondY) {
    const closestPointOnLine = closestPointToLine(circleX, circleY, firstX, firstY, secondX, secondY);
    if (closestPointOnLine && Math.abs((closestPointOnLine.x - circleX) * (closestPointOnLine.x - circleX) + (closestPointOnLine.y - circleY) * (closestPointOnLine.y - circleY)) < circleRadius * circleRadius + 1) {
        return closestPointOnLine;
    } else {
        return null;
    }
}

function twoCircleCollisionPoint(firstX, firstY, firstRadius, secondX, secondY, secondRadius) {
    const collisionPointX = ((firstX * secondRadius) + (secondX * firstRadius)) / (firstRadius + secondRadius);
    const collisionPointY = ((firstY * secondRadius) + (secondY * firstRadius)) / (firstRadius + secondRadius);
    return { x: collisionPointX, y: collisionPointY };
}

function circleCollisionTwoMoving(firstDx, firstDy, secondDx, secondDy, collisionOptions = null) {
    // first assume circles are same mass regardless of size
    let firstMass = 1;
    let secondMass = 1;

    if (collisionOptions) {
        if (collisionOptions['firstMass']) firstMass = collisionOptions['firstMass'];
        if (collisionOptions['secondMass']) secondMass = collisionOptions['secondMass'];
    }

    const newFirstDx = (firstDx * (firstMass - secondMass) + (2 * secondMass * secondDx)) / (firstMass + secondMass);
    const newFirstDy = (firstDy * (firstMass - secondMass) + (2 * secondMass * secondDy)) / (firstMass + secondMass);
    const newSecondDx = (secondDx * (secondMass - firstMass) + (2 * firstMass * firstDx)) / (firstMass + secondMass);
    const newSecondDy = (secondDy * (secondMass - firstMass) + (2 * firstMass * firstDy)) / (firstMass + secondMass);

    return { firstDx: newFirstDx, firstDy: newFirstDy, secondDx: newSecondDx, secondDy: newSecondDy };
}

function circleCollisionMovingAndStationary(movingX, movingY, movingDx, movingDy, stationaryX, stationaryY, collisionOptions = null) {
    // first assume circles are same mass regardless of size
    let firstMass = 1;
    let secondMass = 1;
    let staticSecond = false;

    if (collisionOptions) {
        // eslint-disable-next-line no-unused-vars
        if (collisionOptions['firstMass']) firstMass = collisionOptions['firstMass'];
        // eslint-disable-next-line no-unused-vars
        if (collisionOptions['secondMass']) secondMass = collisionOptions['secondMass'];
        if (collisionOptions['staticSecond']) staticSecond = collisionOptions['staticSecond'];
    }

    if (staticSecond) {
        // static will remain unmoved

        let dx = -movingDx; //Reverse direction
        let dy = -movingDy;
        const speed = Math.sqrt(squared(dx) + squared(dy));
        const currentAngle = Math.atan2(dy, dx);

        //The angle between the ball's center and the orbs center
        const reflectionAngle = Math.atan2(stationaryY - movingY, stationaryX - movingX);
        //The outcome of this "static" collision is just a angular reflection with preserved speed
        const newAngle = 2 *  reflectionAngle - currentAngle;

        dx = speed * Math.cos(newAngle); //Setting new velocity
        dy = speed * Math.sin(newAngle);

        return { movingDx: dx, movingDy: dy, stationaryDx: 0, stationaryDy: 0 };
    } else {
        // both objects will move

        const collisionAngle = angleBetweenPointsRadian(movingX, movingY, stationaryX, stationaryY);
        const origMagnitude = Math.sqrt(squared(movingDx) + squared(movingDy));

        let mAngleRadian = collisionAngle / 2;
        const mMagnitude = origMagnitude * Math.cos(collisionAngle / 2);
        let mDx = projectPointX(0, mMagnitude, mAngleRadian);
        let mDy = projectPointY(0, mMagnitude, mAngleRadian);

        let sAngleRadian = (Math.PI - collisionAngle) / 2;
        const sMagnitude = origMagnitude * Math.sin(collisionAngle / 2);
        let sDx = projectPointX(0, sMagnitude, sAngleRadian);
        let sDy = projectPointY(0, sMagnitude, sAngleRadian);

        return { movingDx: mDx, movingDy: mDy, stationaryDx: sDx, stationaryDy: sDy };
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