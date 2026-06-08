# Career Roulette

Career Roulette is a lightweight career-conversation game built with Angular.
It helps users explore possible role directions by presenting role cards, collecting preferences, and generating a simple interest profile plus a career canvas.

This repository is intended as a public demo/prototype for learning and experimentation.

## Purpose

The goal of this project is to support structured growth conversations by making career exploration interactive:

1. Users choose a current grade and time horizon.
2. The app shows role cards and captures reactions (`yes`, `maybe`, `no`).
3. The app summarizes themes and suggests potential growth paths.
4. The app generates a practical career canvas with first actions.

## Current Behavior Highlights

1. Random session length between 8 and 12 spins, capped by available unique cards.
2. No duplicate role cards within the same game session.
3. Grade filtering respects selected time horizon:
	1. `1 year`: current grade or one grade higher.
	2. `3 years`: current grade up to two grades higher.
4. Deep-dive moments can occur multiple times based on configured interval.

## Tech Stack

1. Angular 21 (standalone components)
2. TypeScript
3. SCSS
4. JSON-based role configuration

## Project Structure (high level)

1. `src/app/components`: screens and UI building blocks
2. `src/app/services`: game logic and config loading
3. `src/app/models`: application data models
4. `public/assets/config/career-config.json`: role and competency dataset

## Getting Started

### Prerequisites

1. Node.js 20+ recommended (LTS preferred)
2. npm

### Install

```bash
npm install
```

### Run locally

```bash
npm start
```

Open `http://localhost:4200/` in your browser.

### Build

```bash
npm run build
```

Build output is written to `dist/career-roulette`.

### Test

```bash
npm test
```

## Configuration and Data

Main configuration file:

- `public/assets/config/career-config.json`

It contains:

1. Spin/deep-dive settings
2. Grade definitions
3. Role catalog
4. Competencies and knowledge topics

## Public Repository Notice

This is a public repository. Do not commit confidential or proprietary business data, customer data, credentials, internal URLs, or sensitive architecture details.

## Data Quality Disclaimer

The configuration data in this repository is generated/demo content and may be incomplete, outdated, inconsistent, or incorrect.

Treat it as sample input for prototyping only, not as a source of truth for HR, staffing, certification policy, or organizational decisions.

## Contributing

Contributions are welcome through issues and pull requests.

When contributing:

1. Keep sample data generic and non-sensitive.
2. Prefer small, focused changes.
3. Run build/tests before opening a PR.

## License

Add your preferred license (for example MIT) in a `LICENSE` file if this repository will be distributed externally.
