const child = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const path = require("path");
const fs = require("fs");


const createIntermediateSource = (stream) => {
    var myREPL = child.spawn('node');
    myFile = fs.createWriteStream('./4.sock');
    myREPL.stdout.pipe(process.stdout, { end: false });
    myREPL.stdout.pipe(myFile);
    myREPL.stdin.on("end", function() {
      process.stdout.write("REPL stream ended.");
      console.log('Here ended stream!')
    });
    
    myREPL.on('exit', function (code) {
      console.log('Here exit!')
      process.exit(code);
    });
    stream.pipe(myREPL.stdin, { end: false });
    stream.pipe(myFile);
    return './4.sock'
}


const createAudioFile = (fileName, audioStream) => {
    const intermediateSource = createIntermediateSource(audioStream);
    const outputAudioPath = path.join("generated", fileName);

    return new Promise((resolve, reject) => {
        ffmpeg()
          .addInput(intermediateSource)
          .addInputOptions([
            '-f s16le',
            '-ar 48k',
            '-ac 1',
          ])
          .on('start', () => {
            console.log('Creating audio file.');
          })
          .on('end', () => {
            console.log('Created audio file');
            audioStream = null;
            audioSink = null;
            resolve(outputAudioPath);
          })
          .output(outputAudioPath)
          .run();
    });
}

module.exports = { createAudioFile };