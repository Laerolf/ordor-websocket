const app = require('express')()
const http = require('http').createServer(app)
const io = require("socket.io")(http)

const { ReplSet } = require('mongodb-topology-manager');
const mongodb = require('mongodb');

io.on("connection", function (socket) {
    const now = new Date()
    console.log(`[${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}] New connection established.`)

    socket.on("disconnect", function () {
        const now = new Date()
        console.log(`[${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}] Connection disconnected.`)
    })
})


run().catch(error => console.error(error));

http.listen(8282, function () {
    console.log('Listening on port localhost:8282');
});

async function run() {
    console.log(new Date(), 'start');

    /*const replSet = new ReplSet('mongod', [
        { options: { port: 27017, dbpath: `C:\\Program Files\\MongoDB\\Server\\4.0\\data\\ordorSet`, bind_ip } }
    ], { replSet: 'ordorSet' });
*/
    // Initialize the replica set
    //await replSet.purge();
    //await replSet.start();
    //console.log(new Date(), 'Replica set started...');

    // Connect to the replica set
    const uri = 'mongodb://localhost:27017/ordor?replicaSet=ordorSet';
    const client = await mongodb.MongoClient.connect(uri, {useNewUrlParser: true});
    const db = client.db('ordor');

    // Create a change stream. The 'change' event gets emitted when there's a
    // change in the database
    db.collection('venue').watch([], {'fullDocument': 'updateLookup'}).
    on('change', data => {
        const now = new Date()
        console.log(`[${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}] Something changed in the database.`);
        io.emit("databaseUpdate", data.fullDocument);
    });
}
