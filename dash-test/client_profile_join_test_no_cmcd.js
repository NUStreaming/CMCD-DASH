// joining and leaving client lists shoulb be defined here
// joinDurationInMs is the time passed when the playback is started
// leaveDurationInMs is the dration after joining

const url = "http://localhost:8080/media/vod/bbb_30fps_akamai/bbb_30fps.mpd";    // w/o bufferBasedRateControl
const segmentDuration=4;

const clients= [
    {
        joinDurationInMs: 0, 
        numClient: 2,
        videoUrl: url,
        minBuffer: segmentDuration,
        maxBuffer: segmentDuration*2
    },
    {
        joinDurationInMs: 120000, // after 2 minutes 4 clients join 
        numClient: 4,
        videoUrl: url,
        minBuffer: segmentDuration,
        maxBuffer: segmentDuration*2
    },
    {
        joinDurationInMs: 120000, // after 2 minutes 4 clients join 
        leaveDurationInMs: 300000, // 4 clients stay for 5 minutes
        numClient: 4,
        videoUrl: url,
        minBuffer: segmentDuration,
        maxBuffer: segmentDuration*2
    }
  ];

  module.exports = { clients};