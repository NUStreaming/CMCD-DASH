#!/bin/bash

#killall -9 Cascade.sh
#killall -9 Spike.sh

sudo pkill -f Cascade.sh
sudo pkill -f Spike.sh
sudo pkill -f Cascadex2.sh
sudo pkill -f Spikex2.sh
sudo pkill -f Spikex2_B.sh

sudo pkill tc
#sudo pkill tc


sudo tc qdisc delete dev lo root handle 1:0

#sudo tc qdisc delete dev lo root handle 1:0

#sudo tc qdisc delete dev lo root handle 1:0

#sudo tc qdisc delete dev lo root handle 1:0

#sudo tc qdisc delete dev lo root handle 1:0

echo '---------- Shaping End -----------'
