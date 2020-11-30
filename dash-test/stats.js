function computeAverageBitrate(switchHistory, timeRelative) {
    const bitratesPlayed = {};
    let totalDuration = 0;
    let average = 0;
    switchHistory.forEach(s => {
      const { start, end, quality: { bitrate } } = s;

      // const durationPlayed = end - start;
      let durationPlayed = 0;
      if (end !== null) durationPlayed = end - start
      else              durationPlayed = timeRelative - start;
      
      const prevTotal = totalDuration;
      totalDuration += durationPlayed;
      average = ((average * (prevTotal / totalDuration) + (bitrate * (durationPlayed / totalDuration))));
    });

    return average;
}

function computeAveragePlaybackRate(resultByDownload) {
  let total = 0;
  let count = 0;
  let totalNonOne = 0;
  let countNonOne = 0;
  for (var key in resultByDownload) {
    if (resultByDownload.hasOwnProperty(key)) { 
        total += resultByDownload[key].playbackSpeed;
        count += 1;
        if (resultByDownload[key].playbackSpeed > 1 || resultByDownload[key].playbackSpeed < 1) {
          totalNonOne += resultByDownload[key].playbackSpeed;
          countNonOne += 1;
        }
    }
  }
  return {
    averagePlaybackRate: total / count,
    averagePlaybackRateNonOne: totalNonOne / countNonOne
  }
}

module.exports = { computeAverageBitrate, computeAveragePlaybackRate };




  const data = {
    "switchHistory": [
      {
        "start": 16.238865,
        "end": 17.67047,
        "quality": {
          "mediaType": "video",
          "bitrate": 1000000,
          "width": 1280,
          "height": 720,
          "scanType": null,
          "qualityIndex": 2
        }
      },
      {
        "start": 17.67047,
        "end": 41.155665,
        "quality": {
          "mediaType": "video",
          "bitrate": 200000,
          "width": 640,
          "height": 360,
          "scanType": null,
          "qualityIndex": 0
        }
      }
    ],
    "stallDuration": 7306.010000029346,
    "avgLatency": 1.0841599999999998,
    "avgBufferLength": 0.49329600000000023
  }

  const testData = [
      {
          start: 0,
          end: 10,
          quality: {
              bitrate: 100
          }
      },
      {
        start: 10,
        end: 20,
        quality: {
            bitrate: 200
        }
      },
      {
        start: 20,
        end: 30,
        quality: {
            bitrate: 100
        }
    },
  ]


//   console.log(computeAverageBitrate(testData));