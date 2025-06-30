// Created by SENURA
// wa.me/94702139127

const { spawn } = require('child_process');
const path = require('path');

function start() {
    console.log('🔁 Starting SENU MD Bot...');

    let args = [path.join(__dirname, 'main.js'), ...process.argv.slice(2)];
    console.log('Starting with args:\n' + [process.argv[0], ...args].join('\n'));

    let p = spawn(process.argv[0], args, {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    })
    .on('message', data => {
        if (data === 'reset') {
            console.log('♻️ Restarting SENU MD Bot...');
            p.kill();
            start();
        }
    })
    .on('exit', code => {
        console.error('❌ Bot exited with code:', code);
        if (code === '.' || code === 1 || code === 0) {
            console.log('🔄 Auto-restarting SENU MD Bot...');
            start();
        }
    });
}

start();
