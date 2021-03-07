#!/bin/bash

# request user input
read -p "Run batch test for [1] single client or [2] multiple clients: " testType
reg='^[0-9]+$'
if ! [[ $testType =~ $reg ]] || ([ $testType -ne 1 ] && [ $testType -ne 2 ]); then
  echo "[ERROR] Invalid user input, exiting with code 1.."
  exit 1
fi

read -p "Enter experiment code or description: " expt_code

runs_per_profile=2

# get test profiles
profiles_file="batch_test_profiles"
declare -a profiles_array
while IFS= read -r profile
do
  if [[ $profile == \#* ]]; then continue; fi # skip profiles that are commented out
  profiles_array=("${profiles_array[@]}" $profile)
done < "$profiles_file"

echo "Profiles retrieved: ${profiles_array[@]}"
num_profiles=${#profiles_array[@]}

num_runs=$((runs_per_profile*num_profiles))
current_total_run=0
current_profile_run=0

# create copy of original package.json
config_file="./package.json";
cp $config_file $config_file.original

# create results folder
timestamp=$(date +%s)
result_folder="batch_$timestamp"
mkdir results/$result_folder

echo "---------------------------"
echo "[Starting batch_test..]"
echo "Total profiles: $num_profiles"
echo "Runs per profile: $runs_per_profile"
echo "Total runs: $num_runs"
echo "---------------------------"

for profile in "${profiles_array[@]}"
do
  while [ $current_profile_run -lt $runs_per_profile ]
  do
    current_total_run=$((current_total_run+1))
    current_profile_run=$((current_profile_run+1))

    comments="[batch_test] $expt_code $profile ss $current_profile_run"
    echo "------------------------------------------------------"
    echo "($current_total_run/$num_runs) Processing:"
    echo "\"$comments\".."
    echo "------------------------------------------------------"

    # configure package.json
    jq --arg profile "$profile" '.config.network_profile = $profile' $config_file > $config_file.tmp && mv $config_file.tmp $config_file
    jq '.batchTest.enabled = true' $config_file > $config_file.tmp && mv $config_file.tmp $config_file
    jq --arg comments "$comments" '.batchTest.comments = $comments' $config_file > $config_file.tmp && mv $config_file.tmp $config_file
    jq --arg result_folder "$result_folder" '.batchTest.resultFolder = $result_folder' $config_file > $config_file.tmp && mv $config_file.tmp $config_file

    ### Comment out as there is no dash server
    # # run dash server in background
    # bash ../dash-ll-server/run_server.sh &>/dev/null &
    # last_pid=$!
    # sleep 0.5

    # if ! kill -0 $last_pid ; then
    #   echo "[ERROR] dash server could not run, exiting with code 1.."
    #   exit 1
    # fi
    ### End comment out

    # run test
    # npm run test
    if [ $testType -eq 1 ]; then
      npm run test
    elif [ $testType -eq 2 ]; then
      npm run test-multiple
    fi

    # check if test was successfully executed, e.g. no time-out
    num_results=$(ls results/$result_folder | wc -l | sed 's/ //g')
    if ((num_results<current_total_run)); then
      # command returned error, e.g. time-out during initialization
      # decrement counters since loop was not succesfully ran
      current_profile_run=$((current_profile_run-1))
      current_total_run=$((current_total_run-1))
    fi

    ### Comment out as there is no dash server
    # # kill dash server and (single) child process
    # kill $(pgrep -P $last_pid | grep -o '[0-9]*') # has to kill child first
    # kill $last_pid
    # # kill -- -$(ps -o pgid= $last_pid | grep -o '[0-9]*')  # kill by process grp id, not good as current shell is also terminated   
    ### End comment out
  
    echo "Done run ($current_total_run/$num_runs)!"

    # short stagger between runs
    echo "Sleeping between runs..."
    sleep 5
  done

  echo "Done Profile $profile!"

  # reset count for next profile
  current_profile_run=0
  echo ""

done

# reset package.json to original
mv $config_file.original $config_file
