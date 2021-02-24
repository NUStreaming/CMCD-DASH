// joining and leaving client lists shoulb be defined here
// joinDurationInMs is the time passed when the playback is started
// leaveDurationInMs is the dration after joining

//
// Set video urls
//
const url = "http://localhost:8080/media/vod/bbb_30fps_akamai/bbb_30fps.mpd";    // w/o bufferBasedRateControl
const segmentDuration = 4;

// const urls = [
//     "http://localhost:8080/media/vod/QualaDataset/v1.mpd",
//     "http://localhost:8080/media/vod/QualaDataset/v2.mpd",
//     "http://localhost:8080/media/vod/QualaDataset/v3.mpd",
//     "http://localhost:8080/media/vod/QualaDataset/v4.mpd"
// ]
// const segmentDuration = 2;

//
// Set (global) min and max buffer values. Option to customize by client below.
//
const minBufferGlobal = segmentDuration;
const maxBufferGlobal = segmentDuration * 2;

// **********************************
// Basic scenario: 10 clients with single video
// **********************************
const clients =  [
    {
        joinDurationInMs: 0,
        numClient: 10,
        videoUrl: url,
        minBuffer: minBufferGlobal,
        maxBuffer: maxBufferGlobal
    }
];

// **********************************
// 4x clients with 4 different videos
// **********************************
// const numClientsPerVideo = 1;
// const clients =  [
//     {
//         joinDurationInMs: 0,
//         numClient: numClientsPerVideo,
//         videoUrl: urls[0],
//         minBuffer: minBufferGlobal,
//         maxBuffer: maxBufferGlobal
//     },
//     {
//         joinDurationInMs: 0,
//         numClient: numClientsPerVideo,
//         videoUrl: urls[1],
//         minBuffer: minBufferGlobal,
//         maxBuffer: maxBufferGlobal
//     },
//     {
//         joinDurationInMs: 0,
//         numClient: numClientsPerVideo,
//         videoUrl: urls[2],
//         minBuffer: minBufferGlobal,
//         maxBuffer: maxBufferGlobal
//     },
//     {
//         joinDurationInMs: 0,
//         numClient: numClientsPerVideo,
//         videoUrl: urls[3],
//         minBuffer: minBufferGlobal,
//         maxBuffer: maxBufferGlobal
//     }
// ];

// **********************************
// Flash crowd scenario with single video, and varying min/maxBuf
// **********************************
// const clients= [
//     {
//         joinDurationInMs: 0,
//         numClient: 2,
//         videoUrl: url,
//         minBuffer: segmentDuration,
//         maxBuffer: segmentDuration*2
//     },
//     {
//         joinDurationInMs: 0,
//         numClient: 0,
//         videoUrl: url,
//         minBuffer: segmentDuration,
//         maxBuffer: 20
//     },
//     {
//         joinDurationInMs: 120000, // after 2 minutes 3 clients join
//         numClient: 3,
//         videoUrl: url,
//         minBuffer: segmentDuration,
//         maxBuffer: segmentDuration*2
//     },
//     {
//         joinDurationInMs: 120000, // after 2 minutes 5 clients join
//         leaveDurationInMs: 360000, // 5 clients stay for 6 minutes
//         numClient: 5,
//         videoUrl: url,
//         minBuffer: segmentDuration,
//         maxBuffer: segmentDuration*2
//     }
// ];

module.exports = { clients};
