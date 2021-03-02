#!/bin/bash

# IMPT:
# $ sudo apt-get install jq

# USAGE:
# $ sudo vi cmcd_server/nginx/cmcd_njs.js    // Select appropriate maxCapacity value according to profile to be selected
# $ sudo nginx -c <ABSOLUTE_PATH_TO_REPO>/CMCD/CMCD-DASH/cmcd-server/nginx/config/nginx.conf -s reload
# $ sudo vi dash-test/client_profile_join_test_no_cmcd.js    // Select appropriate video url and no. clients
# $ sudo vi dash-test/client_profile_join_test_with_cmcd.js    // Select appropriate video url and no. clients
# $ sudo vi batch_test_cmcd.sh    // Edit NUMRUNS, PROFILE values, and VIDEO description for comment in results
# $ sudo bash batch_test_cmcd.sh


# @CONFIGURE
NUMRUNS=5
PROFILE="10c_Cascade"
VIDEO="Akamai vid min:12s max:24s"


# NO_CMCD #

## Update package.json
sudo jq -c '.config.client_profile = "./client_profile_join_test_no_cmcd_live"' package.json > tmp.$$.json && mv tmp.$$.json package.json
sudo jq -c '.config.network_profile = "'$PROFILE'"' package.json > tmp.$$.json && mv tmp.$$.json package.json

for (( c=1; c<=$NUMRUNS; c++ ))
do
    sudo bash tc-network-profiles/kill.sh
    echo "${PROFILE}. no_cmcd. ${VIDEO}. ss $c" | sudo npm run test-multiple
done


# WITH_CMCD #

## Update package.json
sudo jq -c '.config.client_profile = "./client_profile_join_test_with_cmcd_live"' package.json > tmp.$$.json && mv tmp.$$.json package.json

for (( c=1; c<=$NUMRUNS; c++ ))
do
    sudo bash tc-network-profiles/kill.sh
    echo "${PROFILE}. with_cmcd. ${VIDEO}. ss $c" | sudo npm run test-multiple
done

sudo rm package.json
sudo cp package.json.original package.json

sudo bash tc-network-profiles/kill.sh

