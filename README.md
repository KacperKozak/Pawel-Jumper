# Pawel Jumper 🚴‍♂️💨

Jump between the good parts of your files faster than a bike off a ramp.

## What this extension does

Jump fast around your files without thinking:

- Blank-line jumps: with no selection, move to the previous/next blank line.
- Occurrence jumps: with any text selected, move to the previous/next occurrence of that exact text.
- Smart blocks: long code blocks get split into internal stops using a max jump distance, so you jump to the center first and then exit, instead of inching line-by-line near the edges.

It’s named after a classic Polish internet meme “Paweł Jumper” — a legendary 68-second saga about ambition, momentum, and gravity. This extension aims for the first two and avoids the third. If you’re curious, tutaj „to już się kameruje”: [`Paweł Jumper` on Wikipedia](https://pl.wikipedia.org/wiki/Pawe%C5%82_Jumper).

Pro tip (and a little jest): big blank deserts and chunky code ramps won’t send you wobbling line-by-line anymore — you’ll glide to the center like a stylish bunny hop, not land „jak Paweł”.

### Settings

- `pawel-jumper.maxJumpDistance` (number, default `5`)
  - Maximum number of lines to leap inside a block before creating internal mid-stops.

### Default keybindings

MacOS:

- Pawel Jumper: Hop Up — `Cmd+Ctrl+Up`
- Pawel Jumper: Hop Down — `Cmd+Ctrl+Down`
- Pawel Jumper: Select Up — `Shift+Cmd+Ctrl+Up`
- Pawel Jumper: Select Down — `Shift+Cmd+Ctrl+Down`

Windows/Linux:

- Pawel Jumper: Hop Up — `Ctrl+Alt+PageUp`
- Pawel Jumper: Hop Down — `Ctrl+Alt+PageDown`
- Pawel Jumper: Select Up — `Shift+Ctrl+Alt+PageUp`
- Pawel Jumper: Select Down — `Shift+Ctrl+Alt+PageDown`

Use the Command Palette to invoke the commands by name or customize keybindings in your settings.

## Development

- Install deps: `bun install`
- Build: `bun run compile`
- Watch: `bun run watch`

## Packaging

- Update `package.json` metadata as needed
- Publish via VS Code Marketplace or Open VSX
