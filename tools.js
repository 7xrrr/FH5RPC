const { exec } = require('child_process');

const isProcessActive = async (processName) => {
    return new Promise((resolve, reject) => {
        exec('tasklist', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing tasklist: ${error}`);
                resolve(false);
                return;
            }

            if (stderr) {
                console.error(`Error executing tasklist: ${stderr}`);
                resolve(false);
                return;
            }

            const isActive = stdout.includes(processName);
            resolve(isActive);
        });
    });
};


function kWToHp(kW) {
    const hp = kW * 1.34102;
    return hp;
}

function mpsToKmph(mps) {
    return mps * 3.6;
}

module.exports = {
    isProcessActive,
    kWToHp,
    mpsToKmph

}


