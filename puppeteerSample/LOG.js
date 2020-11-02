const puppeteer = require('puppeteer-core');
const fs = require('fs');

const user_data_dir = process.argv[2];
const run = process.argv[3];
const video = process.argv[4];
const consoleGivenHost = process.argv[5];
const host = "localhost";
const url = 'http://' + consoleGivenHost + ':3000/?name=run_' + run + '&vid=' + video;
const macExec = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const linuxExec = 'google-chrome';
console.log("completeURI: " + url);
console.log("run var: " + run);
console.log("Played back video: " + video);
console.log("Streaming server: " + consoleGivenHost);
let progress = 0;



async function stop(browser) {
  await browser.close();
  process.exit();
}

async function start() {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: linuxExec,
      userDataDir: user_data_dir,
      pipe: true,
    });
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.goto(url);
  
    function saveMetricLists(metrics) {
      let savedMetrics = 0;
      const date = Date.now();
      const logDir = __dirname + '/logs/vid_' + video.replace('/', '-') + '_run_' + run + '_' + date;
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
      }
      const qualityStream = fs.createWriteStream(logDir + '/' + 'qualityLog.json', {flags: 'w'});
      const segmentStream = fs.createWriteStream(logDir + '/' + 'segmentLog.json', {flags: 'w'});
      qualityStream.write(JSON.stringify(metrics.qualityLog));
      segmentStream.write(JSON.stringify(metrics.segmentLog));
      qualityStream.end(function () {
        if (savedMetrics < 1) {
          savedMetrics++
        } else {
          stop(browser);
        }
      });
      segmentStream.end(function () {
        if (savedMetrics < 1) {
          savedMetrics++
        } else {
          stop(browser);
        }
      });
    }
  
    function getMetricLists() {
      try {
        let metricLogs = {
          qualityLog: qualityLog,
          segmentLog: segmentLog
        };
        return Promise.resolve(JSON.stringify(metricLogs));
      } catch (error) {
        return Promise.reject(error);
      }
    }
  
    function getProgress() {
      try {
        let playbackTime = player.getDashMetrics().getCurrentDVRInfo("video").time;
        let videoLength = player.duration();
        let progress = Math.round((playbackTime / videoLength) * 100);
        return Promise.resolve(JSON.stringify(progress))
      } catch (e) {
        return Promise.reject(e);
      }
    }
  
    async function getMetricList() {
      page.evaluate(getMetricLists)
        .then((metric) => {
          process.stdout.write('.');
          metric = JSON.parse(metric);
          saveMetricLists(metric);
        })
        .catch((error) => {
          process.stdout.write("ERROR - metrics could not be logged");
        });
    }
    // Define a window.onPlaybackEnded function (it is executed here but available on the page)
    await page.exposeFunction('onPlaybackEnded', () => {
      console.log('Playback ended!');
      getMetricList();
    });
    // Listen for playbackEnded on the page
    await page.evaluate(() => {
      player.on('playbackEnded', window.onPlaybackEnded);
    });
    
    await page.exposeFunction('canPlay', () => {
      page.evaluate(() => {
        //player.play();
        //isPlaying = 1;
      });
      const videoProgress = setInterval(async () => {
        page.evaluate(getProgress)
          .then((newProgress) => {
            newProgress = JSON.parse(newProgress);
            if (newProgress != progress) {
              progress = newProgress;
              process.stdout.write(newProgress.toString() + "% ")
            }
          })
          .catch((e) => {

          })
      }, 100);
      
    });
    
    await page.evaluate(() => {
      player.on('canPlay', window.canPlay);
    });
  
  
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();
