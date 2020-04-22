const express = require("express");
const { ExpressPeerServer } = require("peer");

const app = express();

app.use(express.static("static"));

const server = app.listen(9000);

const peerServer = ExpressPeerServer(server, {
    path: "/"
});

app.use("/peerjs", peerServer);