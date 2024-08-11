export {
    getPoolTableSizes, getPoolTableDecorationSizes, getPoolEquipmentSizes,
}

/*
sizes
- table 9ft, 2:1 ratio
- play area 100 x 50 inches / 254 x 127 cm
- table width = 254 (play area) + 10 (cushion * 2) + 22 (rail * 2) = 286 cm
- table height = 127 + 10 + 22 = 159 cm
- rails 5-9,4 cm
- cushions 5 cm
- pockets 5,5 cm radius
- diamonds / sights, center mid-rail (9,4 cm) from cushion nose edge, 3 x 1,5 cm
- cue-stick 148 cm long, tip 0,7 cm radius, base  1cm radius
- balls 2,85 cm radius


stylings
- diamonds / sights (1/8 for long, 1/4 for short), silver-grey
- rounded table corners
- metallic table corners?
*/

// pool game equipment sizes in cm

const playAreaWidthActual = 254;
const playAreaHeightActual = 127;
const railWidthActual = 9; // 5 - 9,4 cm actual
const cushionWidthActual = 5;
const tableWidthActual = playAreaWidthActual + railWidthActual * 2 + cushionWidthActual * 2; // 254 (play area) + 10 (cushion * 2) + 22 (rail * 2) = 286 cm
const tableHeightActual = playAreaHeightActual + railWidthActual * 2 + cushionWidthActual * 2; // 127 + 10 + 22 = 159 cm

const tableWidthFactor = 1; // origin of other calculations
const tableHeightFactor = tableHeightActual / tableWidthActual; // 1/2 factor, 159 cm
const playAreaWidthFactor = playAreaWidthActual / tableWidthActual; // 9ft / 100 inches / 254 cm actual
const playAreaHeightFactor = playAreaHeightActual / tableWidthActual; // 1/2 factor, 50 inches / 127 cm actual

const railWidthFactor = railWidthActual / tableWidthActual; // 5 cm actual, 11 cm for visuals
const cushionWidthFactor = cushionWidthActual / tableWidthActual; // 5 cm
const mouthCushionAngleRadian = Math.PI * 0.3;
const pocketRadiusFactor = 5.5 / tableWidthActual; // 5.5 cm

function getPoolTableSizes(tableWidth) {
    return {
        tableWidth: tableWidth * tableWidthFactor,
        tableHeight: tableWidth * tableHeightFactor,
        playAreaWidth: tableWidth * playAreaWidthFactor,
        playAreaHeight: tableWidth * playAreaHeightFactor,
        railWidth: tableWidth * railWidthFactor,
        cushionWidth: tableWidth * cushionWidthFactor,
        mouthCushionWidth: tableWidth * (cushionWidthFactor * Math.tan(mouthCushionAngleRadian)),
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
const diamondWidthFactor = 1.5 / tableWidthActual; // // 1/2 factor, 1.5 cm

function getPoolTableDecorationSizes(tableWidth) {
    return {
        diamondCenterFromNose: tableWidth * diamondCenterFromNoseFactor,
        diamondLength: tableWidth * diamondLengthFactor,
        diamondWidth: tableWidth * diamondWidthFactor,
    }
}
