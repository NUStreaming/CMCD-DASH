# CMCD-DASH
CMCD-enabled dash.js prototype for paper titled: "Use of CMCD in HTTP Adaptive Streaming: Initial Findings" (Mar 2021).

## Quick Start

Run nginx server:
- See `cmcd-server/readme` for details on setup and usage

Run dash.js:
- Path: `CMCD-DASH/`
- `cd dash.js`
- `npm install`
- `grunt dev`
- Navigate to `http://localhost:3000/samples/cmcd-dash/index.html`

Run single test with network profile:
- Path: `CMCD-DASH/`
- `cd dash-test`
- `npm install`
- Update desired profile in: `package.json`
- Update desired video and client params in: `client_profile_join_test_no_cmcd.js` and `client_profile_join_test_with_cmcd.js`
- Clear any previous tc setup: `sudo bash tc-network-profiles/kill.sh` (*must run before any test!*)
- Run single test with multiple clients: `npm run test-multiple`
- Alternative batch test script for multiple runs across no_cmcd and with_cmcd: Update params in `batch_test_cmcd.sh` and run


<!-- ## TODO

- Set up `cmcd-server/`, and update `run.js` with server command (if any)
- Add to `dash-test-batch` multi-client headless mode
- Determine vod/live streaming and metrics, and update `index.html`, `run.js`, `dash-test-batch/` accordingly -->