const admin = require("firebase-admin");
const { spawn } = require("child_process");

const serviceAccount = require("./minecraft-controller-firebase-adminsdk-mu9uj-ac92cbba8b.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://minecraft-controller.firebaseio.com"
});

const db = app.firestore();

var server = false;
var first = true;
db.doc('servers/4oyMSMnh58q2QnnxS8vX').onSnapshot((x) => {
    const serverOn = x.data().serverOn;
    console.log("server changed to:", serverOn ? 'ON' : 'OFF');
    if(serverOn && (first || !server.connected)) executeServer();
    else if(!serverOn && server) server.kill();

});

function executeServer() {
    first = false;
    server = spawn("java", ["-Xmx1024M", "-Xms1024M", "/home/minecraft/server.jar", "nogui"]);

    server.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });

    server.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    server.on('error', (error) => {
        db.doc('servers/4oyMSMnh58q2QnnxS8vX').update({serverOn: false});
    });

    server.on("close", code => {
        db.doc('servers/4oyMSMnh58q2QnnxS8vX').update({serverOn: false});
    });
}





