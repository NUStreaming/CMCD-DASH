// joining and leaving client lists shoulb be defined here
// joinDurationInMs is the time passed when the playback is started
// leaveDurationInMs is the dration after joining

const url="http://localhost:8080/cmcd-njs/bufferBasedRateControl/media/vod/bbb_30fps_akamai/bbb_30fps.mpd";
const segmentDuration=4;

const clients= [
    {
        joinDurationInMs: 0, 
        //numClient: 2,
        numClient: 10,
        videoUrl: url,
        minBuffer: segmentDuration,
        maxBuffer: segmentDuration*2
    },
    {
        joinDurationInMs: 0,
        numClient: 0,
        videoUrl: url,
        minBuffer: segmentDuration,
        maxBuffer: 20
    },
    {
        joinDurationInMs: 120000, // after 2 minutes 3 clients join
        //numClient: 3,
        numClient: 0,
        videoUrl: url,
        minBuffer: segmentDuration,
        maxBuffer: segmentDuration*2
    },
    {
        joinDurationInMs: 120000, // after 2 minutes 5 clients join
        leaveDurationInMs: 360000, // 5 clients stay for 6 minutes
        //numClient: 5,
        numClient: 0,
        videoUrl: url,
        minBuffer: segmentDuration,
        maxBuffer: segmentDuration*2
    }
  ];

  module.exports = { clients};
