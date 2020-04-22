// HandPose Data Reception
//////////////////////////
const fingers = ["Little", "Ring", "Middle", "Index", "Thumb"];
const parts = ["Proximal", "Intermediate", "Distal"];

function handposeMessage(e) {
    overlay3Ctx.clearRect(0, 0, overlay.width, overlay.height);
    const data = e.data;
    if (!data.hands || data.hands.length === 0) return;

    const hand = data.hands[0];
    const landmarks = hand.landmarks;

    var side;
    if ((leftWrist || rightWrist) && !(leftWrist && rightWrist))
        side = leftWrist ? "left" : "right";
    else if (leftWrist && rightWrist) {
        const wristPos = landmarks[0];
        const leftPos = leftWrist.position;
        const rightPos = rightWrist.position;
        const leftDist = distance(leftPos.x, leftWrist.y, wristPos[0], wristPos[1]);
        const rightDist = distance(rightPos.x, rightPos.y, wristPos[0], wristPos[1]);

        side = leftDist < rightDist ? "left" : "right";
    } else {
        return
    }

    const middleA1 = pointToVec(hand.annotations.middleFinger[1]);
    const middleVertex = pointToVec(landmarks[0]);

    var angles = {};
    const mult = side === "left" ? -1 : 1;

    for (var key in hand.annotations) {
        if (!hand.annotations.hasOwnProperty(key)) continue;
        if (key === "palmBase") continue;

        var points = hand.annotations[key];
        points.unshift(landmarks[0]);
        var vecs = points.map(p => pointToVec(p));

        var joints = [];

        for (var i = 1; i < vecs.length - 1; i++) {
            const a1 = vecs[i - 1];
            const vertex = vecs[i];
            const a2 = vecs[i + 1];
            joints.push(mult * getAngle(a1, vertex, a2) - Math.PI);
        }

        if (key !== "middleFinger") joints.push(mult * getAngle(middleA1, middleVertex, vecs[2]));

        angles[key] = joints;
    }

    const rotations = {
        Little: angles.pinky,
        Ring: angles.ringFinger,
        Middle: angles.middleFinger,
        Index: angles.indexFinger,
        Thumb: angles.thumb
    };

    fingers.forEach(finger => {
        const rots = rotations[finger];
        const axis = finger === "Thumb" ? "y" : "z";
        const fingerObj = getFinger(side, finger);

        if (finger !== "Middle" && finger !== "Thumb") fingerObj.Proximal.x = rots[3];
        fingerObj.Proximal[axis] = rots[0];
        fingerObj.Intermediate[axis] = rots[1];
        fingerObj.Distal[axis] = rots[2];
    });

    drawHand(data.hands, overlay3Ctx, side === "left" ? "#0f0" : "cyan");

    stats.handpose.end();
}

function getFinger(side, finger) {
    const fingerObj = {};
    const sidePrefix = side.charAt(0).toUpperCase() + side.slice(1);

    parts.forEach(part => {
        fingerObj[part] = vrmManager.rotation(Bone[sidePrefix + finger + part]);
    });

    return fingerObj;
}