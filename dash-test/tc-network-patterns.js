// This profile represents smooth, long-term changes which lie comfortably between renditions.
const Cascade = [
    {
      speed: 50000,
      duration: 30
    },
    {
      speed: 20000,
      duration: 30
    },
    {
      speed: 10000,
      duration: 30
    },
    {
      speed: 5000,
      duration: 30
    },
    {
      speed: 10000,
      duration: 30
    },
    {
      speed: 20000,
      duration: 30
    }
  ];

// This profile represents a sharp downward spike in bandwidth.
const Spike = [
  {
    speed: 20000,
    duration: 30
  },
  {
    speed: 5000,
    duration: 30
  }
];

// This profile represents smooth, long-term changes which lie comfortably between renditions.
const Cascadex2 = [
  {
    speed: 100000,
    duration: 30
  },
  {
    speed: 40000,
    duration: 30
  },
  {
    speed: 20000,
    duration: 30
  },
  {
    speed: 10000,
    duration: 30
  },
  {
    speed: 20000,
    duration: 30
  },
  {
    speed: 40000,
    duration: 30
  }
];

// This profile represents a sharp downward spike in bandwidth.
const Spikex2 = [
{
  speed: 40000,
  duration: 30
},
{
  speed: 10000,
  duration: 30
}
];


module.exports = { Cascade, Spike, Cascadex2, Spikex2 };
