// FaceMesh Data Reception
//////////////////////////
var head = { x: 0, y: 0, z: 0, mouth: 0 };

var rightEyeData = [];
var leftEyeData = [];

function resetEye() {
    rightEyeData = [];
    leftEyeData = [];
}

var nextBlinkTS = 0;

function facemeshMessage(e) {
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);
    const data = e.data;

    const face = data.faces[0];

    if (face) {
        const mesh = face.scaledMesh;
        mesh.forEach(point => drawPoint(overlayCtx, point[0], point[1], 1.5, "#36f"));

        const { roll, yaw, pitch } = getHeadRotation(overlayCtx, face.scaledMesh);

        const mouthRight = mesh[78];
        const mouthLeft = mesh[308];
        const mouthWidth = distance3d(mouthRight, mouthLeft);

        const mouthTop = mesh[13];
        const mouthBottom = mesh[14];
        const mouthHeight = distance3d(mouthTop, mouthBottom);

        vrmManager.tween(head, { x: pitch, y: yaw, z: roll, mouth: mouthHeight / mouthWidth }, () => {
            var neckNode = vrmManager.rotation(Bone.Neck);
            neckNode.x = head.x + Math.PI / 2;
            neckNode.y = head.y;
            neckNode.z = head.z;

            vrmManager.setPreset(Preset.A, head.mouth);
        }, "head", null, 100);

        if (inputs.blink.checked) {
            if (Date.now() > nextBlinkTS) {
                vrmManager.setPreset(Preset.Blink, 1);
                nextBlinkTS = Date.now() + random(5000, 8000);
            } else vrmManager.setPreset(Preset.Blink, 0);
        } else {
            // Right
            const rightEyeImg = clipEyeImage(ctx, mesh, 159, 145, 33, 133);
            const processedRightEye = processEyeImage(rightEyeImg);

            linkSize(rightEyeCanvas, rightEyeImg);
            rightEyeCtx.putImageData(processedRightEye.thresholded, 0, 0);

            rightEyeData.push(processedRightEye.ratio);
            const meanRight = calcMean(rightEyeData);
            const stdevRight = stdev(rightEyeData);
            const zScoreRight = (processedRightEye.ratio - meanRight) / stdevRight;

            // Left
            const leftEyeImg = clipEyeImage(ctx, mesh, 386, 374, 362, 263);
            const processedLeftEye = processEyeImage(leftEyeImg);

            linkSize(leftEyeCanvas, leftEyeImg);
            leftEyeCtx.putImageData(processedLeftEye.thresholded, 0, 0);

            leftEyeData.push(processedLeftEye.ratio);
            const meanLeft = calcMean(leftEyeData);
            const stdevLeft = stdev(leftEyeData);
            const zScoreLeft = (processedLeftEye.ratio - meanLeft) / stdevLeft;

            if ((zScoreLeft <= -1.5 && zScoreRight <= -0.5) || (zScoreLeft <= -0.5 && zScoreRight <= -1.5)) {
                vrmManager.setPreset(Preset.Blink, 1);
            } else {
                vrmManager.setPreset(Preset.Blink, 0);

                if (zScoreRight <= -1.5) vrmManager.setPreset(Preset.BlinkR, 1);
                else vrmManager.setPreset(Preset.BlinkR, 0);

                if (zScoreLeft <= -1.5) vrmManager.setPreset(Preset.BlinkL, 1);
                else vrmManager.setPreset(Preset.BlinkL, 0);
            }
        }
    }
}