#!/bin/bash

for (( c=1; c>0; c++ ))
do

#sudo tc qdisc del dev enp0s3 root
echo "Setting network speed to 20mbit for 30 seconds via tc"
sudo tc qdisc add dev enp0s3 root handle 1: htb default 10
sudo tc class add dev enp0s3 parent 1: classid 1:1 htb rate 20000kbit
sudo tc class add dev enp0s3 parent 1:1 classid 1:10 htb rate 20000kbit
sudo tc qdisc add dev enp0s3 parent 1:10 handle 10: sfq perturb 10
sudo tc filter add dev enp0s3 parent 1:0 protocol ip prio 1 u32 \
match ip dport 80 0xffff flowid 1:10
sleep 30s

echo "Setting network speed to 5mbit for 170 seconds via tc"
sudo tc qdisc del dev enp0s3 root
sudo tc qdisc add dev enp0s3 root handle 1: htb default 10
sudo tc class add dev enp0s3 parent 1: classid 1:1 htb rate 5000kbit
sudo tc class add dev enp0s3 parent 1:1 classid 1:10 htb rate 5000kbit
sudo tc qdisc add dev enp0s3 parent 1:10 handle 10: sfq perturb 10
sudo tc filter add dev enp0s3 parent 1:0 protocol ip prio 1 u32 \
match ip dport 80 0xffff flowid 1:10
sleep 170s


echo "Done!"
sudo tc qdisc del dev enp0s3 root
done
