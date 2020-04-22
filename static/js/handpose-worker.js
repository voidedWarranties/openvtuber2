self.importScripts("tf/tfjs.js", "tf/handpose.js");

var model;

async function init() {
    model = await handpose.load();

    postMessage("HandPose Loaded " + tf.getBackend());
}

init();

onmessage = async e => {
    if (model) {
        const hands = await model.estimateHands(e.data);

        return postMessage({
            hands
        });
    }

    postMessage({});
}