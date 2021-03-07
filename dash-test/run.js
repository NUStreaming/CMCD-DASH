const fs = require("fs");
const puppeteer = require("puppeteer-core");
const normalNetworkPatterns = require("./normal-network-patterns.js");
const fastNetworkPatterns = require("./fast-network-patterns.js");
const customNetworkPatterns = require("./custom-network-patterns.js");
const tcNetworkPatterns = require("./tc-network-patterns.js");
const stats = require("./stats");

const CHROME_PATH = "/opt/google/chrome/chrome";
//const CHROME_PATH ="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const {QoeEvaluator, QoeInfo} = require("../dash.js/samples/cmcd-dash/abr/LoLp_QoEEvaluation.js");

let patterns;
if (process.env.npm_package_config_ffmpeg_profile === 'PROFILE_FAST') {
  patterns = fastNetworkPatterns;
} else {
  patterns = normalNetworkPatterns
}

const configNetworkProfile = process.env.npm_package_config_network_profile;
// const NETWORK_PROFILE = patterns[configNetworkProfile] || patterns.PROFILE_CASCADE;
let NETWORK_PROFILE;
if (patterns[configNetworkProfile]) {
  NETWORK_PROFILE = patterns[configNetworkProfile]
} else if (customNetworkPatterns[configNetworkProfile]) {
  NETWORK_PROFILE = customNetworkPatterns[configNetworkProfile]
} else if (tcNetworkPatterns[configNetworkProfile]) {
  NETWORK_PROFILE = tcNetworkPatterns[configNetworkProfile]
} else {
  console.log("Error! network_profile not found, exiting with code 1...");
  process.exit(1);
}
console.log("Network profile:", configNetworkProfile);
console.log(NETWORK_PROFILE);

// custom
const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
let throughputMeasurements = { trueValues: [], measuredValues: [] };

// Wait X ms before starting browser
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
const waitSeconds = 10;
console.log('Wait ' + waitSeconds + 's before starting browser..');
sleep(waitSeconds * 1000).then(() => {

  run()
    .then((result) => {
      if (result) {
        if (!fs.existsSync('./results')){
          fs.mkdirSync('./results');
        }

        let timestamp = Math.floor(Date.now() / 1000);
        let folder = './results/' + timestamp;
        if (process.env.npm_package_batchTest_resultFolder)
          folder = './results/' + process.env.npm_package_batchTest_resultFolder + '/' + timestamp;
        if (!fs.existsSync(folder)){
          fs.mkdirSync(folder);
        }

        let filenameByDownload = folder + '/metrics-by-download.json';
        let filenameOverall = folder + '/metrics-overall.json';
        let filenameEvaluate = folder + '/evaluate.json';
        let filenameQoePerSegment = folder + '/qoe-by-segment.json';
        let filenameThroughput = folder + '/throughput-measurements.json';
      
        fs.writeFileSync(filenameByDownload, JSON.stringify(result.byDownload));
        fs.writeFileSync(filenameOverall, JSON.stringify(result.overall));

        /////////////////////////////////////
        // evaluate.js
        /////////////////////////////////////
        /* testTime, networkPattern, abrStrategy, comments, etc.
        * + resultsQoe obj
        *  - averageBitrate
        *  - averageBitrateVariations / numSwitches (added both)
        *  - totalRebufferTime
        *  - startupDelay (not used for now as startup is invalid with stabilization feature in the testing)
        *  - averageLatency (not in standard QoE model but avail here first)
        */
        let evaluate = {};
        evaluate.testTime = new Date();
        evaluate.networkProfile = result.networkProfile;
        evaluate.networkPattern = result.networkPattern;
        evaluate.abrStrategy = result.abrStrategy;
        evaluate.customPlaybackControl = result.customPlaybackControl;

        ///////////////////////////////////////////////////////////////////////////////////
        // QoE model
        // References - See QoeEvaluator.js 
        //            - https://xia.cs.cmu.edu/resources/Documents/Yin_sigcomm15.pdf
        ///////////////////////////////////////////////////////////////////////////////////
        let qoeEvaluator = new QoeEvaluator();
        let segmentDurationSec = result.misc.segmentDurationSec;
        let maxBitrateKbps = result.misc.maxBitrateKbps;
        let minBitrateKbps = result.misc.minBitrateKbps;
        qoeEvaluator.setupPerSegmentQoe(segmentDurationSec, maxBitrateKbps, minBitrateKbps);

        // let qoeBySegmentCsv = [];
        // qoeBySegmentCsv.push('segment, qoe_overall, qoe_bitrate, qoe_rebuf, qoe_latency, qoe_bitrateSwitch, qoe_playbackSpeed');
        let qoePerSegment = {};

        let numSegments = 0;
        for (var key in result.byDownload) {
          if (result.byDownload.hasOwnProperty(key)) {
            let segmentBitrateKbps = result.byDownload[key].segmentBitrateKbps;
            let segmentRebufferTimeSec = result.byDownload[key].segmentStallDurationMs / 1000.0;
            let latencySec = result.byDownload[key].currentLatency;
            let playbackSpeed = result.byDownload[key].playbackSpeed;
            qoeEvaluator.logSegmentMetrics(segmentBitrateKbps, segmentRebufferTimeSec, latencySec, playbackSpeed);

            // Log qoe result at each segment
            let qoeInfo = qoeEvaluator.getPerSegmentQoe();
            // let tmpArray = [key, qoeInfo.totalQoe, qoeInfo.bitrateWSum, qoeInfo.rebufferWSum, qoeInfo.latencyWSum, qoeInfo.bitrateSwitchWSum, qoeInfo.playbackSpeedWSum];
            // qoeBySegmentCsv.push(tmpArray.toString());
            qoePerSegment[key] = {
              qoeTotal: qoeInfo.totalQoe,
              qoeBitrate: qoeInfo.bitrateWSum,
              qoeRebuffer: qoeInfo.rebufferWSum,
              qoeLatency: qoeInfo.latencyWSum,
              qoeBitrateSwitch: qoeInfo.bitrateSwitchWSum,
              qoePlaybackSpeed: qoeInfo.playbackSpeedWSum
            }

            throughputMeasurements.measuredValues.push({ 
              throughputKbps: result.byDownload[key].throughputKbps, 
              timestampMs: result.byDownload[key].throughputTimestampMs 
            });

            numSegments++;
          }
        }

        evaluate.resultsQoe = qoeEvaluator.getPerSegmentQoe(); // returns QoeInfo object
        evaluate.numSegments = numSegments;

        // Old QoE calculations (before QoeEvaluator.js)
        // // QoE score breakdown, initialize weights to 0 first
        // evaluate.resultsQoe = {
        //   averageBitrate:           { weight: 0, value: (result.overall.averageBitrate / 1000),           subtotal: 0},  // raw units: bps, QoE units: kbps
        //   averageBitrateVariations: { weight: 0, value: (result.overall.averageBitrateVariations / 1000), subtotal: 0},  // raw units: bps, QoE units: kbps
        //   numSwitches:              { weight: 0, value: result.overall.numSwitches,                       subtotal: 0},
        //   totalRebufferTime:        { weight: 0, value: (result.overall.stallDurationMs / 1000),          subtotal: 0},  // raw units: ms, QoE units: s
        //   averageLatency:           { weight: 0, value: result.overall.averageLatency,                    subtotal: 0}   // raw units: s, QoE units: s
        //   // startupDelay:             { weight: 0, value: result.startupDelay,                              subtotal: 0}  // current units: s, QoE units: s
        // };

        // // select desired weights - BALANCED
        // evaluate.resultsQoe.averageBitrate.weight = 1;
        // evaluate.resultsQoe.averageBitrateVariations.weight = 1;
        // evaluate.resultsQoe.totalRebufferTime.weight = 3000;
        // // evaluate.resultsQoe.startupDelay.weight = 3000;

        // // calculate total QoE score
        // let total = 0;
        // for (var key in evaluate.resultsQoe) {
        //   if (evaluate.resultsQoe.hasOwnProperty(key)) {
        //     // calculate subtotal for each component first
        //     evaluate.resultsQoe[key].subtotal = evaluate.resultsQoe[key].weight * evaluate.resultsQoe[key].value;

        //     if (key === 'averageBitrate') total += evaluate.resultsQoe[key].subtotal;
        //     else  total -= evaluate.resultsQoe[key].subtotal;
        //   }
        // }
        // evaluate.resultsQoe.total = total;
        // Old QoE calculations - END
        
        // convert string to boolean
        const batchTestEnabled = (process.env.npm_package_batchTest_enabled == 'true');

        // finally, allow to optionally input comments
        if (!batchTestEnabled) {
          // user input
          readline.question('Any comments for this test run: ', data => {
            evaluate.comments = data;
            readline.close();
            
            fs.writeFileSync(filenameEvaluate, JSON.stringify(evaluate));
            fs.writeFileSync(filenameQoePerSegment, JSON.stringify(qoePerSegment));
            fs.writeFileSync(filenameThroughput, JSON.stringify(throughputMeasurements));
  
            // // Generate csv file
            // let csv = '';
            // for (var i = 0; i < qoeBySegmentCsv.length; i++) {
            //   csv += qoeBySegmentCsv[i];
            //   csv += '\n';
            // }
            // fs.writeFileSync(filenameQoePerSegment, csv);
  
            console.log('Results files generated:');
            console.log('> ' + filenameByDownload);
            console.log('> ' + filenameOverall);
            console.log('> ' + filenameEvaluate);
            console.log('> ' + filenameQoePerSegment);
            console.log('> ' + filenameThroughput);
            console.log("Test finished. Press cmd+c to exit.");
          });
        }
        else {
          // batch script input
          if (process.env.npm_package_batchTest_comments)
            evaluate.comments = process.env.npm_package_batchTest_comments;
          else
            evaluate.comments = "Batch test, no additional comments."

          fs.writeFileSync(filenameEvaluate, JSON.stringify(evaluate));
          fs.writeFileSync(filenameQoePerSegment, JSON.stringify(qoePerSegment));
          fs.writeFileSync(filenameThroughput, JSON.stringify(throughputMeasurements));
  
          console.log('Results files generated:');
          console.log('> ' + filenameByDownload);
          console.log('> ' + filenameOverall);
          console.log('> ' + filenameEvaluate);
          console.log('> ' + filenameQoePerSegment);
          console.log('> ' + filenameThroughput);
          console.log('')

          process.exit(0);
        }
      }
      else {
        console.log('Unable to generate test results, likely some error occurred.. Please check program output above.')
        console.log("Exiting with code 1...");
        process.exit(1);
      }
    })
    .catch(error => console.log(error));

  async function run() {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: CHROME_PATH,
      defaultViewport: null,
      devtools: true,
    });

    // const page = await browser.newPage();
    // Create a new incognito browser context.
    const context = await browser.createIncognitoBrowserContext();
    // Create a new page in a pristine context.
    const page = await context.newPage();
    //test mode setuser agent to puppeteer
    page.setUserAgent("puppeteer");

    await page.goto("http://localhost:3000/samples/cmcd-dash/index.html");
    const cdpClient = await page.target().createCDPSession();

    console.log("Waiting for player to setup.");
    await page.evaluate(() => {
      return new Promise(resolve => {
        const hasLoaded = player.getBitrateInfoListFor("video").length !== 0;
        if (hasLoaded) {
          console.log('Stream loaded, setup complete.');
          resolve();
        } else {
          console.log('Waiting for stream to load.');
          player.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, (e) => {
            console.log('Load complete.')
            resolve();
        });
        }
      });
    });

    console.log("Waiting for 10 seconds of uninterrupted max-quality playback before starting.");
    const stabilized = await awaitStabilization(page);
    if (!stabilized) {
      console.error(
        "Timed out after 30 seconds. The player must be stable at the max rendition before emulation begins. Make sure you're on a stable connection of at least 3mbps, and try again."
      );
      return;
    }
    console.log("Player is stable at the max quality, beginning network emulation");
    page.evaluate(() => {
      window.startRecording();
    });

    await runNetworkPattern(cdpClient, NETWORK_PROFILE);

    const metrics = await page.evaluate(() => {
      if (window.stopRecording) {
        // Guard against closing the browser window early
        window.stopRecording();
      }
      player.pause();
      return window.abrHistory;
    });
    console.log("Run complete");
    if (!metrics) {
      console.log("No metrics were returned. Stats will not be logged.");
    }

    ////////////////////////////////////
    // original results returned
    ////////////////////////////////////
    // console.log(metrics);

    // for (let i = 0; i < metrics.switchHistory.length; i++) {
    //   console.log('switchHistory: bitrate = ' + metrics.switchHistory[i].quality.bitrate + ', qualityIndex = ' + metrics.switchHistory[i].quality.qualityIndex);
    // }

    // ({ switchHistory, ...result } = metrics);
    // result.averageBitrate = stats.computeAverageBitrate(switchHistory);
    // result.numSwitches = switchHistory.length;

    // console.log(result);

    ////////////////////////////////////
    // may.lim: custom results returned
    ////////////////////////////////////
    // console.log(metrics);
    console.log('Processing client metrics to results files..');

    // metrics-by-download.json
    let resultByDownload = {};
    let numStalls = 0;
    if (metrics.byDownload) {
      resultByDownload = metrics.byDownload;
      for (var key in resultByDownload) {
        if (resultByDownload.hasOwnProperty(key)) { 
            resultByDownload[key].averageBitrate = stats.computeAverageBitrate(resultByDownload[key].switchHistory, resultByDownload[key].downloadTimeRelative);
            resultByDownload[key].numSwitches = resultByDownload[key].switchHistory.length;
            if (resultByDownload[key].numStalls > numStalls)  numStalls = resultByDownload[key].numStalls;
        }
      }
    }

    // metrics-overall.json
    let resultOverall = {};
    if (metrics.overall) {
      resultOverall = metrics.overall;
      resultOverall.averageBitrate = stats.computeAverageBitrate(resultOverall.switchHistory);
      resultOverall.numSwitches = resultOverall.switchHistory.length;
      resultOverall.numStalls = numStalls;
      // calculate averageBitrateVariations
      if (resultOverall.switchHistory.length > 1) {
        let totalBitrateVariations = 0;
        for (var i = 0; i < resultOverall.switchHistory.length - 1; i++) {
          totalBitrateVariations += Math.abs(resultOverall.switchHistory[i+1].quality.bitrate - resultOverall.switchHistory[i].quality.bitrate);
        }
        resultOverall.averageBitrateVariations = totalBitrateVariations / (resultOverall.switchHistory.length - 1);
      } else {
        resultOverall.averageBitrateVariations = 0; 
      }
      // calculate average playback rates
      let pbr = stats.computeAveragePlaybackRate(resultByDownload);
      resultOverall.averagePlaybackRate = pbr.averagePlaybackRate;
      resultOverall.averagePlaybackRateNonOne = pbr.averagePlaybackRateNonOne;
      // delete unwanted data
      delete resultOverall.currentLatency;
      delete resultOverall.currentBufferLength;
    }

    let result = {
      byDownload: resultByDownload,
      overall: resultOverall,
      networkProfile: configNetworkProfile,
      networkPattern: NETWORK_PROFILE,
      abrStrategy: metrics.abrStrategy,
      customPlaybackControl: metrics.customPlaybackControl,
      misc: metrics.misc
    };

    return result;

  }

  async function awaitStabilization (page) {
    return await page.evaluate(() => {
      console.log('Awaiting stabilization...')
      return new Promise(resolve => {
        const maxQuality = player.getBitrateInfoListFor("video").length - 1;
        let timer = -1;

        const failTimer = setTimeout(() => {
          resolve(false);
        }, 30000)

        if (player.getQualityFor("video") === maxQuality) {
          console.log('Starting stabilization timer...')
          timer = setTimeout(() => {
            clearTimeout(failTimer);
            resolve(true);
          }, 10000);
        }

        player.on(dashjs.MediaPlayer.events.QUALITY_CHANGE_RENDERED, e => {
          console.warn("Quality changed requested", e);
          if (e.newQuality !== maxQuality) {
            console.log('Clearing stabilization timer...', e.newQuality, maxQuality)
            clearTimeout(timer);
            timer = -1;
          } else if (timer === -1) {
            console.log('Starting stabilization timer...')
            timer = setTimeout(() => {
              clearTimeout(failTimer);
              resolve(true);
            }, 10000);
          }
        });
      });
    });
  }

  async function runNetworkPattern(client, pattern) {
    for await (const profile of pattern) {
      console.log(
        `Setting network speed to ${profile.speed}kbps for ${profile.duration} seconds`
      );
      throughputMeasurements.trueValues.push({ 
        throughputKbps: profile.speed, 
        duration: profile.duration, 
        startTimestampMs: Date.now() 
      });

      setNetworkSpeedInMbps(client, profile.speed);
      await new Promise(resolve => setTimeout(resolve, profile.duration * 1000));
    }
  }

  function setNetworkSpeedInMbps(client, mbps) {
    client.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 0,
      uploadThroughput: (mbps * 1024) / 8,
      downloadThroughput: (mbps * 1024) / 8
    });
  }

});

