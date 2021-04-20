#!/bin/bash

# IMPT:
# $ sudo apt-get install jq

# USAGE:
# $ sudo vi cmcd_server/nginx/cmcd_njs.js    // Select appropriate maxCapacity value according to profile to be selected
# $ sudo nginx -c <ABSOLUTE_PATH_TO_REPO>/CMCD/CMCD-DASH/cmcd-server/nginx/config/nginx.conf -s reload
# $ sudo vi dash-test/client_profile_join_test_no_cmcd.js    // Select appropriate video url and no. clients
# $ sudo vi dash-test/client_profile_join_test_with_cmcd.js    // Select appropriate video url and no. clients
# $ sudo vi batch_test.sh    // Edit NUMRUNS, PROFILE values, and VIDEOCOMMENT to add comment to results file
# $ sudo bash batch_test.sh


# @CONFIGURE
NUMRUNS=2
PROFILE="10c_Cascade"
VIDEOCOMMENT="Akamai video, minBuf:4s maxBuf:8s"
# END @CONFIGURE

# NO_CMCD #

## Update package.json
sudo jq -c '.config.client_profile = "./client_profile_join_test_no_cmcd"' package.json > tmp.$$.json && mv tmp.$$.json package.json
sudo jq -c '.config.network_profile = "'$PROFILE'"' package.json > tmp.$$.json && mv tmp.$$.json package.json

for (( c=1; c<=$NUMRUNS; c++ ))
do
    sudo bash tc-network-profiles/kill.sh
    echo "${PROFILE}. no_cmcd. ${VIDEOCOMMENT}. run $c." | sudo npm run test-multiple-clients
done


# WITH_CMCD #

## Update package.json
sudo jq -c '.config.client_profile = "./client_profile_join_test_with_cmcd"' package.json > tmp.$$.json && mv tmp.$$.json package.json

for (( c=1; c<=$NUMRUNS; c++ ))
do
    sudo bash tc-network-profiles/kill.sh
    echo "${PROFILE}. with_cmcd. ${VIDEOCOMMENT}. run $c." | sudo npm run test-multiple-clients
done

sudo rm package.json
sudo cp package.json.backup package.json

sudo bash tc-network-profiles/kill.sh

