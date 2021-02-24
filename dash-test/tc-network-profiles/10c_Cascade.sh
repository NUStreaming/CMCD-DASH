#!/bin/bash

# Set up logging of shaping values
epochSeconds=$(date +%s)
currentScriptName=`basename "$0"`
fileNameNoExt="${currentScriptName%.*}"
logFile="tc-network-profiles/log/${epochSeconds}_${fileNameNoExt}.csv"
sudo echo "timestamp, bandwidth, duration" >> $logFile

function runShaping {
    epochSeconds=$(date +%s)
    sudo echo "${epochSeconds}, ${1}, ${2}" >> $logFile
    echo "Setting network speed to ${1}mbit for ${2}s via tc"
    sudo tc qdisc add dev lo root handle 1: htb default 10
    sudo tc class add dev lo parent 1: classid 1:1 htb rate ${1}mbit
    sudo tc class add dev lo parent 1:1 classid 1:10 htb rate ${1}mbit
    sudo tc qdisc add dev lo parent 1:10 handle 10: sfq perturb 10
    sudo tc filter add dev lo parent 1:0 protocol ip prio 1 u32 \
    match ip dport 80 0xffff flowid 1:10
    sleep ${2}s
    sudo tc qdisc del dev lo root
}

for (( c=1; c>0; c++ ))
do
    bwMbit=100
    durSec=30
    runShaping $bwMbit $durSec

    bwMbit=40
    durSec=30
    runShaping $bwMbit $durSec

    bwMbit=20
    durSec=30
    runShaping $bwMbit $durSec

    bwMbit=10
    durSec=30
    runShaping $bwMbit $durSec

    bwMbit=20
    durSec=30
    runShaping $bwMbit $durSec

    bwMbit=40
    durSec=30
    runShaping $bwMbit $durSec

    echo "Done shaping loop!"
    sudo tc qdisc del dev lo root
done
