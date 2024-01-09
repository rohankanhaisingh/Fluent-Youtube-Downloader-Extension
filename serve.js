const express = require("express");
const path = require("path");
const colors = require("colors");

const SERVER_PORT = 4000;


const app = express();
const _colors = colors.enable();

app.use(express.static(path.join(__dirname, "public")));

app.listen(SERVER_PORT, function () {

	console.log(`Development server is running on port: ${SERVER_PORT}`.yellow);
});