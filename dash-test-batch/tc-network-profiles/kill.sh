#!/bin/bash

killall -9 Fast.sh
killall -9 Cascade.sh


sudo pkill tc
sudo pkill tc


sudo tc qdisc delete dev enp0s3 root handle 1:0

sudo tc qdisc delete dev enp0s3 root handle 1:0

sudo tc qdisc delete dev enp0s3 root handle 1:0

sudo tc qdisc delete dev enp0s3 root handle 1:0

sudo tc qdisc delete dev enp0s3 root handle 1:0

echo '----------Shaping End-----------'
