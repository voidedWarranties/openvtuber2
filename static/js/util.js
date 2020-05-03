// Util
///////

// Math
function rad(deg) {
    return deg * (Math.PI / 180);
}

function deg(rad) {
    return rad * (180 / Math.PI);
}

function getRotationA(p1, p2) {
    return Math.atan2(p2[1] - p1[1], p2[0] - p2[0]);
}

function getRotation(p1, p2) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function distance(x1, y1, x2, y2) {
    const horiz = x2 - x1;
    const vert = y2 - y1;

    return Math.sqrt((horiz * horiz) + (vert * vert));
}

function distanceP(p1, p2) {
    return distance(p1.x, p1.y, p2.x, p2.y);
}

function distance3d(p1, p2) {
    const horiz = p2[0] - p1[0];
    const vert = p2[1] - p1[1];
    const depth = p2[2] - p1[2];

    return Math.sqrt((horiz * horiz) + (vert * vert) + (depth * depth));
}

function calcMean(data) {
    var total = 0;
    data.forEach(n => {
        total += n;
    });

    const mean = total / data.length;
    return mean;
}

function stdev(data) {
    const mean = calcMean(data);

    var numerator = 0;
    data.forEach(n => {
        numerator += (n - mean) ** 2;
    });

    return Math.sqrt(numerator / (data.length - 1));
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

// Indicies:
// 0: x, 1: y, 2: z
function slope(xIdx, yIdx, p1, p2) {
    return (p2[yIdx] - p1[yIdx]) / (p2[xIdx] - p1[xIdx]);
}

// Tensorflow
// PoseNet
function getPart(keypoints, name) {
    const part = keypoints.find(k => k.part === name);
    return part;
}

function drawSkeleton(data, overlayCtx) {
    data.adjacentKeyPoints.forEach(keypoints => {
        const p1 = keypoints[0].position;
        const p2 = keypoints[1].position;
        drawLine(overlayCtx, p1.x, p1.y, p2.x, p2.y, 1, "blue");
    });

    data.keypoints.forEach(keypoint => {
        const { y, x } = keypoint.position;
        drawPoint(overlayCtx, x, y, 2, "red");
    });
}

// HandPose
function drawHand(data, overlayCtx, color) {
    data.forEach(hand => {
        hand.landmarks.forEach(point => {
            drawPoint(overlayCtx, point[0], point[1], 2, color);
        });

        for (var key in hand.annotations) {
            if (!hand.annotations.hasOwnProperty(key)) continue;

            var points = hand.annotations[key];
            points.unshift(hand.landmarks[0]);

            drawPolyline(overlayCtx, points, 1, color);
        }
    });
}

function pointToVec(p) {
    return new THREE.Vector3(p[0], p[1], p[2]);
}

function getAngle(a1, vertex, a2) {
    const v1 = a1.clone().sub(vertex).normalize();
    const v2 = a2.clone().sub(vertex).normalize();

    return Math.acos(v1.dot(v2));
}

// FaceMesh
function getHeadRotation(overlayCtx, scaledMesh) {
    const faceRight = scaledMesh[127];
    const faceLeft = scaledMesh[356];

    const faceTop = scaledMesh[10];
    const faceBottom = scaledMesh[200];

    if (!(faceRight && faceLeft && faceTop && faceBottom)) return { roll: 0, yaw: 0, pitch: 0 };

    drawLine(overlayCtx, faceRight[0], faceRight[1], faceLeft[0], faceLeft[1], 2, "#fff");
    drawLine(overlayCtx, faceTop[0], faceTop[1], faceBottom[0], faceBottom[1], 2, "#f0f");

    const rollSlope = slope(0, 1, faceRight, faceLeft);
    const roll = Math.atan(rollSlope);

    const yawSlope = slope(0, 2, faceRight, faceLeft);
    const yaw = Math.atan(yawSlope);

    const pitchSlope = slope(2, 1, faceTop, faceBottom);
    var pitch = Math.atan(pitchSlope);

    if (pitch > 0) {
        pitch -= Math.PI;
    }

    return { roll, yaw, pitch };
}

const rightIdxs = [
    33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7
];

const leftIdxs = [
    263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249
];

function clipEyeImage(ctx, mesh, top, bottom, right, left) {
    const canvas = ctx.canvas;

    const leftPoints = leftIdxs.map(i => mesh[i]);
    const rightPoints = rightIdxs.map(i => mesh[i]);

    const temp = new OffscreenCanvas(canvas.width, canvas.height);
    const tempCtx = temp.getContext("2d");
    clip(tempCtx, leftPoints, canvas);
    clip(tempCtx, rightPoints, canvas);

    const eyeTop = mesh[top];
    const eyeBottom = mesh[bottom];
    const eyeRight = mesh[right];
    const eyeLeft = mesh[left];

    const width = Math.abs(eyeRight[0] - eyeLeft[0]);
    const height = Math.abs(eyeTop[1] - eyeBottom[1]);

    const img = tempCtx.getImageData(eyeRight[0], eyeTop[1], width, height);
    return img;
}

function processEyeImage(img) {
    var brightness = Filters.brightnessContrast(img, 0.9, 5);
    var inverted = Filters.invert(brightness);
    var gaussian = Filters.gaussianBlur(inverted, 5);
    var thresholded = Filters.threshold(gaussian, options.get("threshold"));

    var data = thresholded.data;
    var whitePixels = 0;
    var totalPixels = data.length / 4;
    for (var i = 0; i < data.length; i += 4) {
        var slice = data.slice(i, i + 4);
        if (slice[0] === 255) whitePixels++;
    }

    return {
        ratio: whitePixels / totalPixels,
        thresholded
    };
}

// Canvas
function drawPoint(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawLine(ctx, x1, y1, x2, y2, thickness, color) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawPolyline(ctx, points, thickness, color) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (var i = 1; i < points.length; i++) {
        const point = points[i];
        ctx.lineTo(point[0], point[1]);
    }
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawPolygon(ctx, points, thickness, color) {
    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    const p1 = points[0];
    ctx.moveTo(p1[0], p1[1]);

    for (var i = 1; i < points.length; i++) {
        const point = points[i];
        ctx.lineTo(point[0], point[1]);
    }
    ctx.closePath();
    ctx.stroke();
}

function clip(ctx, points, img) {
    ctx.save();
    ctx.beginPath();
    const p1 = points[0];
    ctx.moveTo(p1[0], p1[1]);

    for (var i = 1; i < points.length; i++) {
        const point = points[i];
        ctx.lineTo(point[0], point[1]);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0);
    ctx.restore();
}

function linkSizes(a, b) {
    a.forEach(obj => linkSize(obj, b));
}

function linkSize(a, b) {
    a.width = b.width;
    a.height = b.height;
}

// Options
function linkInputs(inputs) {
    for (var key in inputs) {
        if (!inputs.hasOwnProperty(key)) continue;

        const input = inputs[key];
        if (input.type === "range") {
            const manual = document.getElementById(input.id + "-manual");
            if (manual) {
                manual.value = input.value;
                manual.min = input.min;
                manual.max = input.max;

                input.onchange = e => manual.value = input.value;
                manual.onchange = e => input.value = manual.value;
            }
        }
    }
}