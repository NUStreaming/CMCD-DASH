// joining and leaving client lists shoulb be defined here
// joinDurationInMs is the time passed when the playback is started
// leaveDurationInMs is the dration after joining

// ****************************************
// @CONFIG - Select video urls and min/max buffer values below.
//         - Option to customize by client further below.
// ****************************************

/*
 * Option A
 */
// /* Single video */
// const url = "http://localhost:8080/cmcd-njs/bufferBasedRateControl/media/vod/bbb_30fps_akamai/bbb_30fps.mpd";
// const segmentDuration = 4;
// /* Simulate live streaming */
// const minBufferGlobal = segmentDuration;
// const maxBufferGlobal = segmentDuration * 2;

/*
 * Option B
 */
/* Four videos */
const urls = [
    "http://localhost:8080/cmcd-njs/bufferBasedRateControl/media/vod/QualaDataset/v1.mpd",
    "http://localhost:8080/cmcd-njs/bufferBasedRateControl/media/vod/QualaDataset/v2.mpd",
    "http://localhost:8080/cmcd-njs/bufferBasedRateControl/media/vod/QualaDataset/v3.mpd",
    "http://localhost:8080/cmcd-njs/bufferBasedRateControl/media/vod/QualaDataset/v4.mpd"
]
const segmentDuration = 2;
/* Simulate vod streaming */
const minBufferGlobal = segmentDuration * 4;
const maxBufferGlobal = segmentDuration * 8;


// ****************************************
// @CONFIG - Select client scenario below.
// ****************************************

/*
 * Basic scenario: 10 clients with single video
 */
// const clients =  [
//     {
//         joinDurationInMs: 0,
//         numClient: 10,
//         videoUrl: url,
//         minBuffer: minBufferGlobal,
//         maxBuffer: maxBufferGlobal
//     }
// ];

/*
 * 4x clients with 4 different videos
 */
const numClientsPerVideo = 1;
const clients =  [
    {
        joinDurationInMs: 0,
        numClient: numClientsPerVideo,
        videoUrl: urls[0],
        minBuffer: minBufferGlobal,
        maxBuffer: maxBufferGlobal
    },
    {
        joinDurationInMs: 0,
        numClient: numClientsPerVideo,
        videoUrl: urls[1],
        minBuffer: minBufferGlobal,
        maxBuffer: maxBufferGlobal
    },
    {
        joinDurationInMs: 0,
        numClient: numClientsPerVideo,
        videoUrl: urls[2],
        minBuffer: minBufferGlobal,
        maxBuffer: maxBufferGlobal
    },
    {
        joinDurationInMs: 0,
        numClient: numClientsPerVideo,
        videoUrl: urls[3],
        minBuffer: minBufferGlobal,
        maxBuffer: maxBufferGlobal
    }
];

/*
 * Flash crowd scenario with single video, and varying min/maxBuf
 */
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
