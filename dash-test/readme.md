## Quickstart

- `npm install`

- `vim package.json`: To configure `network_profile` and `num_clients`
  - List of avail profiles: See `dash-test-custom/tc-network-patterns.js`
- `npm run test-multiple`: To start test
  - On completing test run, results generated in `./results/<timestamp>_multiple/` folder ordered by test run's timestamp
  - To generate summary results acorss all clients in test run: `cd results` > `python generate_summary.py`
- `sudo bash tc-network-profiles/kill.sh`: To kill shaping tasks

## Troubleshooting / Tips

- The network shaping script uses `sudo tc <...>`. So to avoid passwd prompting, add this to your `visudo` file: `ALL ALL=NOPASSWD: /usr/sbin/tc`
- `iperf3 -c localhost` to verify network speed

## Test Scenarios

1. Buffer-based Rate Control (with and without)
  - Open file `CMCD-DASH/dash.js/samples/cmcd-dash/index.html`
  - Search for `url = ` in the file and comment out the desired video url for with / without buffer-based rate control

<!---
## Batch Test
Batch test runs x runs across y profiles.

How to run:
- Enter test profiles in `batch_test_profiles` file
- Edit `runs_per_profile=5` in `batch_test.sh`
- Run `bash batch_test.sh`
- - System will prompt for test type and expt code

NOTE:
- If terminate batch_test.sh midway, the 2 background processes may not be killed properly, check with:
-- `lsof -i :9001`
-- `ps | grep run_server`
- And kill if either process is running.
--->


## Ongoing Issues
- May: Batch test code updated w multiple-client test, but not tested as dash-server not up.
