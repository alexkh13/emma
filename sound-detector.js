
const EventEmitter = require('events');
const spawn   = require('child_process').spawn;
const os      = require('os');

class SoundDetector extends EventEmitter {

  constructor() {
    super();

    this.config = {
      PERCENTAGE_START : '10%',
      PERCENTAGE_END   : '10%'
    }
  }

  start() {

    if(this._started) {
      return;
    }

    this._started = true;

    this._listen();
  }


  stop(){

    this._started = false;

    if(this.recorder) {
      this.recorder.kill();
      this.recorder = null;
    }
  }

  _listen() {

    if(!this._started)
      return this.emit("Listener not running");

    var args = ({
      'Linux'      : ['-t', 'alsa', 'hw:1,0'],
      'Windows_NT' : ['-t', 'waveaudio', '-d'],
      'Darwin'     : ['-t', 'coreaudio', 'default']
    }) [os.type()];

    args.push("-t",  "wav", "-n");
    args.push("--no-show-progress");
    args.push("silence", "1", "0.0001", this.config.PERCENTAGE_START, "1", "0.1", this.config.PERCENTAGE_END);
    args.push("stat");

    var child = spawn("sox", args), body  = "";

    this.recorder = child;
    child.stderr.on("data", function(buf){ body += buf; });

    child.on("exit", () => {
      var {max,duration,rms} = this._parse(body);

      this.emit("detected", {max,duration,rms});

      this._listen();
    });
  }

  _parse(body) {
    body = body.replace(new RegExp("[ \\t]+", "g") , " "); //sox use spaces to align output
    var split = new RegExp("^(.*):\\s*(.*)$", "mg"), match, dict = {}; //simple key:value
    while(match = split.exec(body))
      dict[match[1]] = parseFloat(match[2]);
    return {
      duration: dict['Length (seconds)'],
      rms: dict['RMS amplitude'],
      max: dict['Maximum amplitude']
    };
  }

  isStarted() {
    return this._started;
  }
}


module.exports = SoundDetector;

