#!/bin/bash

for (( c=1; c>0; c++ ))
do

#sudo tc qdisc del dev lo root
echo "Setting network speed to 30mbit for 30 seconds via tc"
sudo tc qdisc add dev lo root handle 1: htb default 10
sudo tc class add dev lo parent 1: classid 1:1 htb rate 30000kbit
sudo tc class add dev lo parent 1:1 classid 1:10 htb rate 30000kbit
sudo tc qdisc add dev lo parent 1:10 handle 10: sfq perturb 10
sudo tc filter add dev lo parent 1:0 protocol ip prio 1 u32 \
match ip dport 80 0xffff flowid 1:10
sleep 30s

echo "Setting network speed to 7.5mbit for 30 seconds via tc"
sudo tc qdisc del dev lo root
sudo tc qdisc add dev lo root handle 1: htb default 10
sudo tc class add dev lo parent 1: classid 1:1 htb rate 7500kbit
sudo tc class add dev lo parent 1:1 classid 1:10 htb rate 7500kbit
sudo tc qdisc add dev lo parent 1:10 handle 10: sfq perturb 10
sudo tc filter add dev lo parent 1:0 protocol ip prio 1 u32 \
match ip dport 80 0xffff flowid 1:10
sleep 30s
#sleep 170s


echo "Done!"
sudo tc qdisc del dev lo root
done
