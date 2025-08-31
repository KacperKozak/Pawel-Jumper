# Pawel Jumper 🚴‍♂️💨

Jump between the good parts of your files faster than a bike off a ramp.

## What this extension does

Jump fast around your files without thinking:

- Blank-line jumps: with no selection, move to the previous/next blank line. Stops at file ends (no wrap).
- Occurrence jumps: with any text selected, move to the previous/next occurrence of that exact text. The match stays selected so you can keep jumping repeatedly. Also stops at ends.

It’s named after a classic Polish internet meme “Paweł Jumper” — a legendary 68-second saga about ambition, momentum, and gravity. This extension aims for the first two and avoids the third. If you’re curious, tutaj „to już się kameruje”: [`Paweł Jumper` on Wikipedia](https://pl.wikipedia.org/wiki/Pawe%C5%82_Jumper).

### Default keybindings (macOS)

- Pawel Jumper: Move Up — Shift+Alt+Up
- Pawel Jumper: Move Down — Shift+Alt+Down

Use the Command Palette to invoke the commands by name on other platforms, or add your own keybindings.

## Development

- Install deps: `bun install`
- Build: `bun run compile`
- Watch: `bun run watch`

## Packaging

- Update `package.json` metadata as needed
- Publish via VS Code Marketplace or Open VSX
