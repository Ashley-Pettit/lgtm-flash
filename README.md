# lgtm-flash

Every time Claude changes your code, the **LGTM Lines** container ship sails across above the prompt.

![The LGTM Lines ship at sea, its L, G and T containers glowing on deck](assets/screenshot-wide.png)

It sails in fast, and the **L**, **G**, **T** and **M** containers slam onto its moving deck one by one, each with a bounce, a puff of dust and a camera shake. The ship stops, the camera pushes in, and **LOOKS · GOOD · TO · ME** scans in above the containers, each word drawing a glowing line down to its letter.

![Close-up: LOOKS GOOD TO ME connected to the L G T M containers](assets/screenshot-closeup.png)

The whole thing takes about six seconds, then the prompt is yours again. The header reads **+40,000 LINES THAT I DIDN'T READ**.

## Install

In a Claude Code terminal session:

```
/plugin install lgtm-flash --marketplace Ashley-Pettit/lgtm-flash
```

Answer `y` to add the marketplace and press Enter for the user scope. The desktop app's Code tab plays the full animated scene; a terminal plays a text-character version of the ship.

## Commands

| Command | What it does |
| --- | --- |
| `/ship` | Launch the ship any time |
| `/ship 120` | Launch it claiming 120 lines in the header |

It also launches by itself after every Write, Edit, MultiEdit or NotebookEdit that succeeds.

## What it can reach

It watches file edits as they finish, reading only the file name. It never changes or blocks an edit. It makes no network calls, starts no processes, and reads or writes no files of yours.

## Credit

The ship, the glowing containers and the header strip are a tribute to [LGTM (Looks Good to Me)](https://www.youtube.com/watch?v=3TNpOD6bov8), a Claude music video by Degenerative Pixels. Go watch it.

## License

MIT
