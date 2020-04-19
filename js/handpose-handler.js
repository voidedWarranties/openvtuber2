// HandPose Data Reception
//////////////////////////
function handposeMessage(e) {
    overlay3Ctx.clearRect(0, 0, overlay.width, overlay.height);
    const data = e.data;
    if (!data.hands || data.hands.length === 0) return;

    const landmarks = data.hands[0].landmarks;

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

    drawHand(data.hands, overlay3Ctx, side === "left" ? "#0f0" : "cyan");
}