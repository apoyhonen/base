export {
    getPoolTableSizes, getPoolTableDecorationSizes, getPoolEquipmentSizes,
}

// pool game equipment sizes in cm

const tableWidthActual = 286; // 9ft / 274 cm actual, 286 cm for visuals
const tableHeightFactor = 149 / tableWidthActual; // 1/2 factor, 137 cm actual, 149 for visuals
const playAreaWidthFactor = 254 / tableWidthActual; // 10 inches / 254 cm
const playAreaHeightFactor = playAreaWidthFactor / 2; // 1/2 factor, 5 inches / 127 cm

const cushionWidthFactor = 5 / tableWidthActual; // 5 cm
const railWidthFactor = (1 - playAreaWidthFactor - cushionWidthFactor * 2) / 2; // 5 cm actual, 11 cm for visuals
const pocketRadiusFactor = 5.5 / tableWidthActual; // 5.5 cm
const mouthCushionAngleRadian = Math.PI * 0.3;

function getPoolTableSizes(tableWidth) {
    return {
        tableWidth: tableWidth,
        tableHeight: tableWidth * tableHeightFactor,
        playAreaWidth: tableWidth * playAreaWidthFactor,
        playAreaHeight: tableWidth * playAreaHeightFactor,
        cushionWidth: tableWidth * cushionWidthFactor,
        mouthCushionWidth: tableWidth * (cushionWidthFactor * Math.tan(mouthCushionAngleRadian)),
        railWidth: tableWidth * railWidthFactor,
        pocketRadius: tableWidth * pocketRadiusFactor,
    }
}

// ball & stick sizes in cm

const ballRadiusFactor = 2.85 / tableWidthActual; // 2.85 cm
const stickLengthFactor = 148 / tableWidthActual; // 148 cm
const stickBaseRadiusFactor = 1 / tableWidthActual; // 1 cm
const stickTipRadiusFactor = 0.7 / tableWidthActual; // 0.7 cm

function getPoolEquipmentSizes(tableWidth) {
    return {
        ballRadius: tableWidth * ballRadiusFactor,
        stickLength: tableWidth * stickLengthFactor,
        stickBaseRadius: tableWidth * stickBaseRadiusFactor,
        stickTipRadius: tableWidth * stickTipRadiusFactor,
    }
}

// decorations sizes in cm

const diamondCenterFromNoseFactor = 9.4 / tableWidthActual; // 9.4 cm from cushion nose
const diamondLengthFactor = 3 / tableWidthActual; // 3 cm
const diamondWidthFactor = diamondLengthFactor / 2; // // 1/2 factor, 1.5 cm

function getPoolTableDecorationSizes(tableWidth) {
    return {
        diamondCenterFromNose: tableWidth * diamondCenterFromNoseFactor,
        diamondLength: tableWidth * diamondLengthFactor,
        diamondWidth: tableWidth * diamondWidthFactor,
    }
}
