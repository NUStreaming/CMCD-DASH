#!/bin/bash
for (( c=1; c>0; c++ ))
do
echo "Setting network speed to 20mbps for 30 seconds via tc"
sudo tc qdisc replace dev enp3s0 root handle 1:0 tbf rate 20000kbit
sleep 30s
echo "Setting network speed to 10mbps for 30 seconds via tc"
sudo tc qdisc replace dev enp3s0 root handle 1:0 tbf rate 10000kbit
sleep 30s
echo "Setting network speed to 2mbps for 30 seconds via tc"
sudo tc qdisc replace dev enp3s0 root handle 1:0 tbf rate 2000kbit
sleep 30s
echo "Setting network speed to 10mbps for 30 seconds via tc"
sudo tc qdisc replace dev enp3s0 root handle 1:0 tbf rate 10000kbit
sleep 30s
echo "Setting network speed to 20mbps for 30 seconds via tc"
sudo tc qdisc replace dev enp3s0 root handle 1:0 tbf rate 20000kbit
sleep 30s
done
