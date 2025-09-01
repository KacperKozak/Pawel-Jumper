# Changelog

All notable changes to this project will be documented in this file.

## 1.1.2

- Fix: Update Windows/Linux default keybindings to use arrow keys
  - `Hop Up` `Ctrl+Alt+Up`, `Hop Down` `Ctrl+Alt+Down`, `Select Up` `Shift+Ctrl+Alt+Up`, `Select Down` `Shift+Ctrl+Alt+Down`

## 1.1.0

- Add: `pawel-jumper.select-up` and `pawel-jumper.select-down` — extend selection to previous/next blank line
- Change: Rename `pawel-jumper.hop-prev` to `pawel-jumper.hop-up` and `pawel-jumper.hop-next` to `pawel-jumper.hop-down`
- Change: Update default keybindings
  - macOS: `Hop Up` `Cmd+Ctrl+Up`, `Hop Down` `Cmd+Ctrl+Down`, `Select Up` `Shift+Cmd+Ctrl+Up`, `Select Down` `Shift+Cmd+Ctrl+Down`
  - Windows/Linux: `Hop Up` `Ctrl+Alt+PageUp`, `Hop Down` `Ctrl+Alt+PageDown`, `Select Up` `Shift+Ctrl+Alt+PageUp`, `Select Down` `Shift+Ctrl+Alt+PageDown`
- Remove: `pawel-jumper.select` command (replaced by hop/select family)
- Add: Max jump distance with `pawel-jumper.maxJumpDistance` (default `5`)
  - Large blocks are split into internal stops; jumps land at the center first, then exit the block
  - Works in both directions for `pawel-jumper.hop-up` and `pawel-jumper.hop-down`
  - Handles files with or without leading/trailing blank lines
- Change: Treat consecutive blank lines as a single stop — jumps land at the center of the blank run
- Change: `pawel-jumper.select-up` and `pawel-jumper.select-down` mirror hop logic (including `pawel-jumper.maxJumpDistance` and blank-run centering)

## 1.0.0

- Add: Jump between blank lines with `Shift+Alt+Up/Down` (no wrap)
- Add: Jump between occurrences of selected text; selection persists across jumps
- Add: Detect multiple matches on the same line (e.g., `ref` in `<div ref={ref} data-ref="x" />`)
- Change: Stop at file ends instead of wrapping to the start/end
- Docs: Update `README.md` with features, keybindings, and a lighthearted origin story

## 0.1.0

- Initial minimal template setup
