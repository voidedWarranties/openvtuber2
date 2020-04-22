self.importScripts("tf/tfjs.js", "tf/posenet.js");

var net;
const minPoseConfidence = 0.15;
const minPartConfidence = 0.75;

async function init() {
  net = await posenet.load({
    architecture: "ResNet50",
    inputResolution: 150,
    outputStride: 16,
    quantSize: 1
    // modelUrl: "../tfmodels/model-stride16.json"
  });

  // net = await posenet.load({
  //   architecture: "MobileNetV1",
  //   outputStride: 16,
  //   inputResolution: { width: 320, height: 240 },
  //   multiplier: 0.75
  // });

  postMessage("PoseNet Loaded " + tf.getBackend());
}

init();

onmessage = async e => {
  if (net) {
    const pose = await net.estimateSinglePose(e.data, {
      flipHorizontal: false
    });

    const filteredKeypoints = pose.keypoints.filter(p => p.score >= minPartConfidence);
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(pose.keypoints, minPartConfidence);

    if (pose.score >= minPoseConfidence) return postMessage({
      score: pose.score,
      keypoints: filteredKeypoints,
      adjacentKeyPoints
    });
  }

  postMessage({});
}
