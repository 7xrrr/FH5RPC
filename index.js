const readline = require("readline");
const forzaServer = require("forza-horizon");
const cars = require("./vehicles.json");
const rpc = require("discord-rpc");
const client = new rpc.Client({ transport: 'ipc' });
const { isProcessActive, kWToHp, mpsToKmph } = require("./tools.js");
const clientId = "1206200584730976266";
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function startForzaServer() {
    rl.question("Enter the port number for Forza Horizon 5 server: ", (port) => {
        startServer(parseInt(port));
        rl.close();
    });
}

function startServer(port) {
    let startTime = Date.now();
    let carInfo = {
        data: null,
        carID: 0,
        carName: null,
        speed: 0,
        Power: 0
    };

    const server = new forzaServer.default(port);

    setInterval(async () => {
        let checkForzaProcess = await isProcessActive("ForzaHorizon5.exe");
        if (!checkForzaProcess) {
            console.log('Forza Horizon 5 server is not active.');
            process.exit();
        }
        let carName = carInfo.carName;
        let kmph = carInfo.speed;
        await client.setActivity({
            details: `${carName ? `${carName}` : "Not in a car"}`,
            state: `${kmph ? `Speed: ${Math.floor(kmph)} km/h` : "In The Menu"}${kmph ? ` | Power: ${carInfo.Power.toFixed(0)} HP` : ""}`,
            startTimestamp: startTime,
            largeImageKey: "forza_horizon_5",
            largeImageText: "Forza Horizon 5",
        }).catch((err) => console.log(err.message));

    }, 4200);

    server.on('data', async data => {
        carInfo.data = data;
        let kmph = mpsToKmph(data.Speed);
        let car = Object.values(cars).find(d => d.id === `${data.CarOrdinal}`);

        let horsepower = kWToHp(data?.Power) / 1000;
        if (horsepower <= 10) horsepower = 15;
        if (data.CarOrdinal === 0) { data.CarOrdinal = carInfo.carID; car = Object.values(cars).find(d => d.id === `${data.CarOrdinal}`); }
        let carName = car ? `${car.manufacturer} ${car.name}` : null;
        if (carInfo.carID !== data.CarOrdinal && data.CarOrdinal !== 0) carInfo = { carID: data.CarOrdinal, Power: horsepower };
        else if (carInfo.carID === data.CarOrdinal && horsepower > carInfo.Power) carInfo.Power = horsepower;
        carInfo.carName = carName ? carName : Object.values(cars).find(d => d.id === `${data.CarOrdinal}`);
        carInfo.speed = kmph;
    });

    client.on('ready', () => {
        console.log('[DEBUG] Presence now active!');
        console.log('[WARN] Do not close this Console as it will terminate the rpc');
        console.log('=================== Error Output ===================');
    });

    server.on("listening", () => { console.log(`[DEBUG] Listening for Forza Horizon 5 on port ${port}`); });

    server.bind();

    client.login({ clientId }).catch(console.error);
}

startForzaServer();

// Handle process exit
process.on('exit', () => {
    console.log('Exiting Forza Horizon 5 RPC client.');
});
