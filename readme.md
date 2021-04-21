# CMCD-DASH
CMCD-enabled dash.js prototype for paper titled: "Use of CMCD in HTTP Adaptive Streaming: Initial Findings" to appear in ACM NOSSDAV 2021. [Here](CMCD_Results_2020_04.pdf) is an early version presented in the DASH-IF special session on April 9th, 2021.

## Setup and Testing

Run the NGINX server:
- Navigate to the `cmcd-server/` folder
- Install the NJS module in NGINX using `sudo apt install nginx-module-njs`
- Edit <PATH_TO_CMCD-DASH> (under `location /media/vod`) in `config/nginx.conf`
- Launch NGINX using `sudo nginx -c <PATH_TO_CMCD-DASH>/cmcd-server/nginx/config/nginx.conf` (note that the absolute path must be used)
- Reload NGINX using `sudo nginx -c <PATH_TO_CMCD-DASH>/cmcd-server/nginx/config/nginx.conf -s reload`, if the configuration has changed
- Test the NJS application `cmcd_njs.js` with CMCD using `http://⟨MachineIP_ADDRESS⟩:8080/cmcd-njs/testProcessQuery?CMCD=bl%3D21300` and verify that it returns a value of 21300 for buffer length (bl)

Run the dash.js client:
- Navigate to the `dash.js/` folder
- Install the dependencies using `npm install`
- Build, watch file changes and launch samples page using `grunt dev`
- Test the dash.js application by navigating to `http://⟨MachineIP_ADDRESS⟩:3000/samples/cmcd-dash/index.html` to view the CMCD-enabled player

Run the experiment:
- Navigate to the `dash-test/` folder
- Install the dependencies using `npm install`
- Edit `network_profile` in `package.json` to specify the desired bandwidth profile for the test. The list of available bandwidth profiles are given in `dash-test/tc-network-profiles/`
- Edit `maxCapacityBitsPerS` in `cmcd-server/nginx/cmcd_njs.js` according to the selected bandwidth profile. Reload the NGINX config since we made a configuration change
- Edit `client_profile` in `package.json` to specify the desired client profile (with CMCD or NO CMCD). There are two client profiles:
    - client_profile_join_test_with_cmcd.js
    - client_profile_join_test_no_cmcd.js
- Update the setup parameters in the two client profile files based on the target scenario, such as the numberof clients (`numClient`), minimum buffer (`minBufferGlobal`), maximum buffer (`maxBufferGlobal`), video location (`url`) and segment duration (`segmentDuration`). The set of video datasets are located in `cmcd-server/nginx/media/vod/`
- Start a test using `npm run test-multiple-clients`. Note that testing is done in Chrome headless mode by default
- Alternatively, to do a batch test with consecutive repeated runs for CMCD and NO CMCD (e.g., a batch test of five CMCD and five NO CMCD runs), update the parameters in the two client profile files and `batch_test.sh` and then run the batch test script with `sudo bash batch_test.sh`
    - Note that the parameter values in `batch_test.sh` will overwrite those in `package.json`, hence there is no need to edit the latter for this batch test run
    - Note that the `jq` tool must be installed to use the batch test script: `sudo apt-get install jq`
    - If the batch test script is terminated prematurely, the background Chrome processes need to be killed
- Once the runs are finished, clear any previous tc setup using `sudo bash tc-network-profiles/kill.sh` (this must be run before starting any new run)
- On completing the test run, results are generated in the `results/<timestamp>_multiple_clients/` folder ordered by the test run’s timestamp
- To generate summary results across all clients in a test run, first navigate to the `results/` folder and then run `python generate_summary.py`



## Other Component Details

There are three main components in this setup and they correspond to the three main sub-folders:

- `cmcd-server`: NGINX server
- `dash.js`: dash.js client
- `dash-test`: Automated testing with Puppeteer and scripts


### NGINX Server

- Nginx JS (NJS) webserver and middleware (NGINX v1.18)
- See `nginx/cmcd_njs.js` for more details on the NJS application logic and implementation
    - Note that request URLs that are prefixed with `/cmcd-njs/bufferBasedRateControl` refer to CMCD requests and will trigger the NJS rate control mechanism
    - Example request with CMCD: `http://localhost:8080/cmcd-njs/bufferBasedRateControl/media/vod/bbb_30fps_akamai/bbb_30fps.mpd` 
    - Example request with NO CMCD: `http://localhost:8080/media/vod/bbb_30fps_akamai/bbb_30fps.mpd`

Other useful commands:
- Check if NGINX is running:
  - `curl http://127.0.0.1:8080`
  - Or `ps -ef | grep nginx`
  - Or `systemctl status nginx` for webserver status
- Log files location: `/var/log/nginx/`
  - To inspect logs: `tail -f error.log` and `tail -f access.log`
  - To capture the custom logs in `cmcd_njs.js`:
    - Create the log file: `sudo touch /var/log/nginx/cmcd.log`
    - Update write permission for the log file: `sudo chmod 666 /var/log/nginx/cmcd.log`
    - To inspect logs: `tail -f cmcd.log`

### dash.js Client

- Official dash.js reference player integrated with CMCD support (dash.js v3.1.3)
- Refer to `dash.js/samples/advanced/cmcd.html` for the offical CMCD-enabled sample player (basic sample)
- Refer to `dash.js/samples/cmcd-dash/index.html` for our setup's dash.js client (we added metrics collection and other supplementary features for our setup)

### Automated Testing with Puppeteer and Scripts

- Puppeteer is used for automated headless Chrome-based testing
- Headless mode can also be turned off in `dash-test/run-multiple-clients.js` (search for parameter `headless`)

Other useful commands:
- Use `iperf3` tool between server and client to measure network speed and verify if shaping works as intended



## Troubleshooting Common Issues

### NGINX Server

- When running `sudo apt install nginx-module-njs`, `module not found` error occurs: Chances are that your version of NGINX is not compatible. Purge your current NGINX and reinstall the latest from: `http://nginx.org/en/linux_packages.html#Ubuntu`

### Testing Environment

- If the batch test script is terminated prematurely, checks must be done to ensure that all background processes are cleared:
    - Chrome: `sudo ps aux | grep chrome` and kill if any is present
    - tc: `sudo bash tc-network-profiles/kill.sh`
- The network shaping script uses `sudo tc <...>`. To avoid/rectify password prompting issues, you may wish to add this to your `visudo` file: `ALL ALL=NOPASSWD: /usr/sbin/tc`
