// joining and leaving client lists shoulb be defined here
// joinDurationInMs is the time passed when the playback is started
// leaveDurationInMs is the dration after joining

const url="http://localhost:8080/cmcd-njs/bufferBasedRateControl/media/vod/bbb_30fps_akamai/bbb_30fps.mpd";
// const url = "http://localhost:8080/media/vod/bbb_30fps_akamai/bbb_30fps.mpd";    // w/o bufferBasedRateControl

const clients= [
    {
        joinDurationInMs: 0, 
        numClient: 2,
        videoUrl: url,
        minBuffer: 2,
        maxBuffer: 10
    },
    {
        joinDurationInMs: 120000, // after 2 minutes 4 clients join 
        numClient: 4,
        videoUrl: url,
        minBuffer: 2,
        maxBuffer: 10
    },
    {
        joinDurationInMs: 120000, // after 2 minutes 4 clients join 
        leaveDurationInMs: 300000, // 4 clients stay for 5 minutes
        numClient: 4,
        videoUrl: url,
        minBuffer: 2,
        maxBuffer: 10
    }
  ];

  module.exports = { clients};