#!/bin/bash

#killall -9 Cascade.sh
#killall -9 Spike.sh

pkill -f Cascade.sh
pkill -f Spike.sh


sudo pkill tc
#sudo pkill tc


sudo tc qdisc delete dev lo root handle 1:0

#sudo tc qdisc delete dev lo root handle 1:0

#sudo tc qdisc delete dev lo root handle 1:0

#sudo tc qdisc delete dev lo root handle 1:0

#sudo tc qdisc delete dev lo root handle 1:0

echo '---------- Shaping End -----------'
