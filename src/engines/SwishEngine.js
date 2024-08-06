import {
    angleBetweenPointsDegreesPositive,
    angleBetweenPointsRadian,
    distanceBetweenPoints, distanceToLine,
    projectPoint,
    randomBetween,
    randomIntBetween
} from "@/util/MathUtil";
import { randomColor } from "@/util/ColorUtil";

export { initEnemies, newEnemy, moveEnemies, enemiesMoved, checkCollisions, removeEnemies, angleToCoords, angleLineByMoveDirections }

// enemies

const initialEnemies = 3;
let enemyId = 0;

function initEnemies(canvas, enemies, charPoint) {
    while (enemies.length > 0) {
        enemies.pop();
    }

    let createdEnemies = 0;
    for (let i = 0; i < initialEnemies; i++) {
        newEnemy(canvas, enemies, charPoint);
        createdEnemies++;
    }

    return createdEnemies;
}

function newEnemy(canvas, enemies, charPoint) {
    let coords = { x: charPoint.x, y: charPoint.y };
    const spawnDirection = randomIntBetween(1, 4); // 1 = top, 2 = right, 3 = bottom, 4 = left

    if (spawnDirection === 1) {
        coords.y = 0;
        coords.x = randomBetween(0, canvas.width);
    } else if (spawnDirection === 2) {
        coords.y = randomBetween(0, canvas.height);
        coords.x = canvas.width;
    } else if (spawnDirection === 3) {
        coords.y = canvas.height;
        coords.x = randomBetween(0, canvas.width);
    } else if (spawnDirection === 4) {
        coords.y = randomBetween(0, canvas.height);
        coords.x = 0;
    }

    enemies.push({ id: enemyId++, x: coords.x, y: coords.y, color: randomColor() });

    return 1;
}

let lastEnemyMoveTimestamp = Date.now();

function enemiesMoved() {
    lastEnemyMoveTimestamp = Date.now();
}

function moveEnemies(enemies, charPoint, enemyCollisionSize, enemySpeedPerSec) {
    const currentTime = Date.now();
    const enemyMoveDelta = enemySpeedPerSec / 1000 * (currentTime - lastEnemyMoveTimestamp);

    enemies.forEach(enemy => {
        const originX = enemy.x;
        const originY = enemy.y;
        const angleBetweenEnemyAndChar = angleBetweenPointsRadian(originX, originY, charPoint.x, charPoint.y);
        const newPoint = projectPoint(originX, originY, enemyMoveDelta, angleBetweenEnemyAndChar);

        if (enemies
            .filter(otherEnemy => enemy.id !== otherEnemy.id && distanceBetweenPoints(newPoint.x, newPoint.y, otherEnemy.x, otherEnemy.y) < enemyCollisionSize)
            .length > 0) {
            return; // enemies collide, don't move this enemy
        }

        enemy.x = newPoint.x;
        enemy.y = newPoint.y;
    })

    lastEnemyMoveTimestamp = Date.now();
}

function checkCollisions(enemies, lineHandlePoint, lineEndPoint, charPoint, killDistance) {
    const enemiesHitByLine = enemies
        .filter(enemy => distanceBetweenPoints(enemy.x, enemy.y, charPoint.x, charPoint.y) < killDistance * 4)
        .filter(enemy => distanceToLine(enemy.x, enemy.y, lineHandlePoint.x, lineHandlePoint.y, lineEndPoint.x, lineHandlePoint.y) < killDistance);
    return removeEnemies(enemies, enemiesHitByLine);
}

function removeEnemies(enemies, enemiesToRemove) {
    enemiesToRemove.forEach(enemyHit => enemies.splice(enemies.indexOf(enemyHit), 1));
    return enemiesToRemove.length;
}

// movement-provision & angles

function angleToCoords(clientX, clientY, originPoint, canvas) {
    const eventX = clientX - canvas.offsetLeft;
    const eventY = clientY - canvas.offsetTop;
    return angleBetweenPointsDegreesPositive(originPoint.x, originPoint.y, eventX, eventY);
}

const angleDirectionChangeIntervalMs = 50;
let lastCrossDirectionalTimestamp = Date.now;

function angleLineByMoveDirections(upPressed, rightPressed, downPressed, leftPressed) {
    let crossDirectional = false;
    let cardinalDirectional = false;
    if (isAnyDirectionPressed(upPressed, rightPressed, downPressed, leftPressed)) {
        // moving is affecting angle
        let angleDegrees;
        if (upPressed) {
            if (rightPressed || leftPressed) {
                angleDegrees = leftPressed ? 225 : 315;
                crossDirectional = true;
            } else {
                angleDegrees = 270;
                cardinalDirectional = true;
            }
        } else if (downPressed) {
            if (rightPressed || leftPressed) {
                angleDegrees = leftPressed ? 135 : 45;
                crossDirectional = true;
            } else {
                angleDegrees = 90;
                cardinalDirectional = true;
            }
        } else {
            angleDegrees = leftPressed ? 180 : 0;
            cardinalDirectional = true;
        }

        if (crossDirectional) lastCrossDirectionalTimestamp = Date.now();

        if (cardinalDirectional) {
            const currTimestamp = Date.now();
            if (currTimestamp - lastCrossDirectionalTimestamp < angleDirectionChangeIntervalMs) return null;
        }

        return angleDegrees;
    }
}

function isAnyDirectionPressed(upPressed, rightPressed, downPressed, leftPressed) {
    return upPressed || rightPressed || downPressed || leftPressed;
}