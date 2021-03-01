#!/bin/bash

# IMPT: sudo apt-get install jq

NUMRUNS=5
PROFILE="10c_Cascade"
VIDEO="Akamai vid min:12s max:24s"

# NO_CMCD

## Update package.json
sudo jq -c '.config.client_profile = "./client_profile_join_test_no_cmcd"' package.json > tmp.$$.json && mv tmp.$$.json package.json
sudo jq -c '.config.network_profile = "'$PROFILE'"' package.json > tmp.$$.json && mv tmp.$$.json package.json

for (( c=1; c<=$NUMRUNS; c++ ))
do
    sudo bash tc-network-profiles/kill.sh
    echo "${PROFILE}. no_cmcd. ${VIDEO}. ss $c" | sudo npm run test-multiple
done


# WITH_CMCD

## Update package.json
sudo jq -c '.config.client_profile = "./client_profile_join_test_with_cmcd"' package.json > tmp.$$.json && mv tmp.$$.json package.json

for (( c=1; c<=$NUMRUNS; c++ ))
do
    sudo bash tc-network-profiles/kill.sh
    echo "${PROFILE}. with_cmcd. ${VIDEO}. ss $c" | sudo npm run test-multiple
done

sudo rm package.json
sudo cp package.json.original package.json

sudo bash tc-network-profiles/kill.sh

