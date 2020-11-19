# Quickstart
`npm install`
`npm run test`   // typical test: 2.5mins (10s stabilization + 2.5mins recording), duration varies based on network profile chosen

On completing test run, results found in `./results/<timestamp>/` folder ordered by test run's timestamp

## Additional: Test multiple clients
Edit number of clients in `package.json` config file.
`npm run test-multiple`

On completing test run, results found in `./results/<timestamp>_multiple/` folder ordered by test run's timestamp


# To change network profile for testing
- Select your desired network profile from `dash-test-custom/normal-network-patterns.js` (or `fast-network-patterns.js` if your machine is not fast enough)
- Update the network profile value in `dash-test-custom/package.json` > `config.network_profile`

# Note
Test run program `dash-test-custom/run.js` here uses `samples/low-latency-custom/index.html` instead of the standard `low-latency` client provided by TGC
- Reason: customized metrics collection
- Warning: should note changes to low-latency client and propagate to low-latency-custom

# Batch Test
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


# Ongoing Issues
- May: `run-multiple-clients.js`: If client_x fails stabilization timer, the test for client_x will not run and results folder will be empty. Suggestion: Remove stabilitation timer.
- May: Test for 5 headless clients on profile slow-jitters is stable on MacBook Pro (w/o dash-server), but performance fluctuates for 10 clients.
- May: Batch test code updated w multiple-client test, but not tested as dash-server not up.
