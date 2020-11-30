#!/bin/bash

for (( c=1; c>0; c++ ))
do

#sudo tc qdisc del dev enp5s0f0 root
sudo tc qdisc add dev enp5s0f0 root handle 1: htb default 10
sudo tc class add dev enp5s0f0 parent 1: classid 1:1 htb rate 20000kbit
sudo tc class add dev enp5s0f0 parent 1:1 classid 1:10 htb rate 20000kbit
sudo tc qdisc add dev enp5s0f0 parent 1:10 handle 10: sfq perturb 10
sudo tc filter add dev enp5s0f0 parent 1:0 protocol ip prio 1 u32 \
match ip dport 80 0xffff flowid 1:10
sleep 30s

sudo tc qdisc del dev enp5s0f0 root
sudo tc qdisc add dev enp5s0f0 root handle 1: htb default 10
sudo tc class add dev enp5s0f0 parent 1: classid 1:1 htb rate 5000kbit
sudo tc class add dev enp5s0f0 parent 1:1 classid 1:10 htb rate 5000kbit
sudo tc qdisc add dev enp5s0f0 parent 1:10 handle 10: sfq perturb 10
sudo tc filter add dev enp5s0f0 parent 1:0 protocol ip prio 1 u32 \
match ip dport 80 0xffff flowid 1:10
sleep 170s


sudo tc qdisc del dev enp5s0f0 root
done
