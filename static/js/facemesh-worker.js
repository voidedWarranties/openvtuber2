self.importScripts("tf/tfjs.js", "tf/facemesh.js");

var model;

async function init() {
    model = await facemesh.load({
        maxFaces: 1
    });

    postMessage("FaceMesh Loaded " + tf.getBackend());
}

init();

onmessage = async e => {
    if (model) {
        const faces = await model.estimateFaces(e.data);

        return postMessage({
            faces
        });
    }

    postMessage({});
}