class WorkerManager {
    constructor() {
        this.workers = {
            facemesh: "js/facemesh-worker.js",
            posenet: "js/posenet-worker.js",
            handpose: "js/handpose-worker.js"
        };

        this.activeWorkers = {};
        this.handlers = {};
        this.pending = {};
        this.ready = {};
    }

    startAll() {
        for (var key in this.workers) {
            if (!this.workers.hasOwnProperty(key)) continue;

            this.start(key);
        }
    }

    start(name) {
        this.activeWorkers[name] = new Worker(this.workers[name]);
        const handler = this.handlers[name];
        if (handler) {
            this.activeWorkers[name].onmessage = e => {
                const data = e.data;
                if (typeof data === "object") {
                    this.pending[name] = false;
                    handler(e);
                } else {
                    this.ready[name] = true;
                    console.log(data);
                }
            }
        };
    }

    stop(name) {
        this.activeWorkers[name].terminate();
        this.activeWorkers[name] = undefined;
        this.ready[name] = false;
        this.pending[name] = false;
    }

    postMessage(name, message) {
        const worker = this.activeWorkers[name];
        if (worker && !this.pending[name] && this.ready[name]) {
            worker.postMessage(message);
            this.pending[name] = true;
        }
    }

    registerHandler(name, handler) {
        this.handlers[name] = handler;
        const worker = this.activeWorkers[name];
        if (worker) worker.onmessage = this.handlers[name];
    }
}