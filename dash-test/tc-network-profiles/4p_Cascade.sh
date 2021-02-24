#!/bin/bash

logFile="log/${EPOCHSECONDS}_4p_Cascade.csv"
echo "timestamp, bandwidth, duration" >> $logFile

for (( c=1; c>0; c++ ))
do
    bwMbit=35
    durSec=10
    runShaping $bwMbit $durSec

    bwMbit=25
    durSec=10
    runShaping $bwMbit $durSec

    bwMbit=20
    durSec=10
    runShaping $bwMbit $durSec

    bwMbit=15
    durSec=10
    runShaping $bwMbit $durSec

    bwMbit=20
    durSec=10
    runShaping $bwMbit $durSec

    bwMbit=25
    durSec=10
    runShaping $bwMbit $durSec

    echo "Done shaping loop!"
    sudo tc qdisc del dev lo root
done

function runShaping {
    echo "Setting network speed to ${1}mbit for ${2}s via tc"
    echo "${EPOCHSECONDS}, ${1}, ${2}" >> $logFile
    sudo tc qdisc add dev lo root handle 1: htb default 10
    sudo tc class add dev lo parent 1: classid 1:1 htb rate ${1}mbit
    sudo tc class add dev lo parent 1:1 classid 1:10 htb rate ${1}mbit
    sudo tc qdisc add dev lo parent 1:10 handle 10: sfq perturb 10
    sudo tc filter add dev lo parent 1:0 protocol ip prio 1 u32 \
    match ip dport 80 0xffff flowid 1:10
    sleep ${2}s
}
