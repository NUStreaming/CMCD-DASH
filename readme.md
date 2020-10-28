# CMCD-DASH

## Quick Start

Run dash.js:
- Path: `CMCD-DASH/`
- `cd dash.js`
- `npm install`
- `grunt dev`
- Navigate to `http://localhost:3000/samples/cmcd-dash/index.html`

Run single test with network profile:
- Path: `CMCD-DASH/`
- `npm install`
- Update desired profile in `package.json`
- `npm run test`


## TODO

- Set up `cmcd-server/`, and update `run.js` with server command (if any)
- Add to `dash-test-batch` multi-client headless mode
- Determine vod/live streaming and metrics, and update `index.html`, `run.js`, `dash-test-batch/` accordingly