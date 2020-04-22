// PoseNet Data Reception
/////////////////////////
var armRotation = {
    rightUpperY: 0,
    rightUpperZ: 0,
    rightLower: 0,
    leftUpperY: 0,
    leftUpperZ: 0,
    leftLower: 0
};

function updateRotation(rotation) {
    const rightUpper = vrmManager.rotation(Bone.RightUpperArm);
    rightUpper.y = rotation.rightUpperY;
    rightUpper.x = -rotation.rightUpperY / 1.5;
    rightUpper.z = rotation.rightUpperZ;
    vrmManager.rotation(Bone.RightLowerArm).z = rotation.rightLower - rotation.rightUpperZ;

    const leftUpper = vrmManager.rotation(Bone.LeftUpperArm);
    leftUpper.y = rotation.leftUpperY;
    leftUpper.x = rotation.leftUpperY / 1.5;
    leftUpper.z = rotation.leftUpperZ;
    vrmManager.rotation(Bone.LeftLowerArm).z = rotation.leftLower - rotation.leftUpperZ;
}

// Inspiration: https://gist.github.com/atskimura/198e558e0eff94774892d4ee9e22f98e
function posenetMessage(e) {
    overlay2Ctx.clearRect(0, 0, overlay.width, overlay.height);
    const data = e.data;

    if (!data.score) return;

    drawSkeleton(data, overlay2Ctx);

    const leftShoulder = getPart(data.keypoints, "leftShoulder");
    const leftElbow = getPart(data.keypoints, "leftElbow");
    leftWrist = getPart(data.keypoints, "leftWrist");

    const rightShoulder = getPart(data.keypoints, "rightShoulder");
    const rightElbow = getPart(data.keypoints, "rightElbow");
    rightWrist = getPart(data.keypoints, "rightWrist");

    if (leftShoulder && rightShoulder) {
        const shoulderRotation = getRotation(rightShoulder.position, leftShoulder.position);
        const width = distanceP(rightShoulder.position, leftShoulder.position);

        if (rightShoulder && rightElbow && rightWrist) {
            const rightUpperY = distanceP(rightShoulder.position, rightElbow.position) / width;
            const rightUpperZ = getRotation(rightElbow.position, rightShoulder.position) - shoulderRotation;
            const rightLower = getRotation(rightWrist.position, rightElbow.position) - shoulderRotation;

            vrmManager.tween(armRotation, {
                rightUpperY: -rightUpperY + Math.PI / 2,
                rightUpperZ,
                rightLower
            }, () => updateRotation(armRotation), "rightArm", {
                rightUpperY: 0,
                rightUpperZ: rad(-75),
                rightLower: rad(-85)
            });
        }

        if (leftShoulder && leftElbow && leftWrist) {
            const leftUpperY = distanceP(leftShoulder.position, leftElbow.position) / width;
            const leftUpperZ = getRotation(leftShoulder.position, leftElbow.position) - shoulderRotation;
            const leftLower = getRotation(leftElbow.position, leftWrist.position) - shoulderRotation;

            vrmManager.tween(armRotation, {
                leftUpperY: leftUpperY - Math.PI / 2,
                leftUpperZ,
                leftLower
            }, () => updateRotation(armRotation), "leftArm", {
                leftUpperY: 0,
                leftUpperZ: rad(75),
                leftLower: rad(85)
            });
        }
    }

    stats.posenet.end();
}