# ui-patterns-alloy

[pebble-examples/ui-patterns](https://github.com/pebble-examples/ui-patterns)
recreated one-to-one in Alloy (JavaScript on the watch, Piu UI), on
[pebble-ui](https://github.com/michaelthatsit/pebble-ui), the library that grew
out of it. Run the app,
then choose a menu option to see one of the recommended Pebble UI patterns:
checkbox list, choice dialog, message dialog, list with a hint, radio button
list, PIN entry, text animation, progress bar, progress layer, app config
prompt.

Emery (Pebble Time 2) and gabbro (Pebble Round 2), the platforms Alloy runs on.

| Pattern | Emery (Pebble Time 2) | Gabbro (Pebble Round 2) |
| --- | --- | --- |
| Main menu | ![Main menu on emery](screenshots/emery/menu.png) | ![Main menu on gabbro](screenshots/gabbro/menu.png) |
| Checkbox list | ![Checkbox list on emery](screenshots/emery/checkbox-checked.png) | ![Checkbox list on gabbro](screenshots/gabbro/checkbox-checked.png) |
| Radio button list | ![Radio button list on emery](screenshots/emery/radio-sel1.png) | ![Radio button list on gabbro](screenshots/gabbro/radio-sel1.png) |
| Message dialog | ![Message dialog on emery](screenshots/emery/message.png) | ![Message dialog on gabbro](screenshots/gabbro/message.png) |
| Choice dialog | ![Choice dialog on emery](screenshots/emery/choice.png) | ![Choice dialog on gabbro](screenshots/gabbro/choice.png) |
| List hint message | ![List hint message on emery](screenshots/emery/listmsg.png) | ![List hint message on gabbro](screenshots/gabbro/listmsg.png) |
| PIN entry | ![PIN entry on emery](screenshots/emery/pin-cell2.png) | ![PIN entry on gabbro](screenshots/gabbro/pin-cell2.png) |
| Text animation | ![Text animation on emery](screenshots/emery/textanim.png) | ![Text animation on gabbro](screenshots/gabbro/textanim.png) |
| Progress bar | ![Progress bar on emery](screenshots/emery/progressbar.png) | ![Progress bar on gabbro](screenshots/gabbro/progressbar.png) |
| Progress layer | ![Progress layer on emery](screenshots/emery/progresslayer.png) | ![Progress layer on gabbro](screenshots/gabbro/progresslayer.png) |
| Config dialog window | ![Config dialog window on emery](screenshots/emery/config.png) | ![Config dialog window on gabbro](screenshots/gabbro/config.png) |

All frames at once: [emery](screenshots/emery/all.png), [gabbro](screenshots/gabbro/all.png).

## One-to-one, verified

The C original was built for emery and gabbro with SDK 4.33.1, driven through
every screen in the emulators, and screenshotted. This app was put through the
same steps and the PNGs diffed pixel by pixel. The menus, the checkbox and
radio lists, the message dialog, the list with its hint and the text
animation are identical on emery, pixel for pixel; on gabbro the same, except
a handful of blended pixels along the round action bar's anti-aliased edge.
The five screens below differ from the C app only where it was adapted
(`screenshots/` holds this app's frames). The behaviours match the C code:
Up/Down with repeat while held, Select and Back per window, the checkbox and
radio submit logs, the PIN callback (`Pin was 2 9 0`), the timers and
animations with the C durations.

Geometry that the C SDK computes internally was measured on the emulators,
not guessed: MenuLayer cells and scrolling, the action bar and its icon
positions, the status bar, the fonts the firmware substitutes on these
displays. Each measured value is named where it is used.

### Adapted for the larger screens

The C windows hard-code a few positions for the original 144x168 screen; built
as-is for emery or gabbro they put text over the icons and cells. Here those
positions are anchored to what they sit next to, so the screens look as the
original does:

| Window | C constant | Here |
| --- | --- | --- |
| Choice dialog | label `top: 112` | the bottom 56 px, the band the icon is inset by |
| App config prompt | body `top: 125` | 2 px under the centred icon |
| PIN entry | title `top: 30`, sub text `top: 115` | 37 px above and 14 px below the centred cells |
| Progress bar | width `144` | the screen's width (the C comment: "system default") |
| Progress layer | `top: 80` | 4 px above the middle |

The list hint keeps the C position (top 140 over a 150 px menu): the original
covers the last row the same way.

## Layout

```
pebble-ui/                         the library (git submodule): menus, status bar, action bar, dialogs, PIN entry, window stack
src/c/mdbl.c                       the JavaScript machine (heap sizes below)
src/embeddedjs/main.js             the application: a pebble-ui WindowStack
src/embeddedjs/assets.js           resource IDs
src/embeddedjs/windows/
  main_window.js                   the menu; six of the ten patterns are pebble-ui windows opened with their data
  list_message_window.js           a menu over a hint
  text_animation_window.js         the text change animation
  progress_bar_window.js           a line under the status bar
  progress_layer_window.js         pebble-ui's ProgressLayer on a timer
resources/images/                  the C project's bitmaps, same resource order
screenshots/{emery,gabbro}/        this app in the emulators
```

Checkbox list, radio button list, the three dialogs and PIN entry are
`CheckboxList`, `RadioList`, `ChoiceDialog`, `MessageDialog`, `ConfigDialog`
and `PinWindow` from pebble-ui, with the C example's strings and resources as
their data (`main_window.js`). The other four windows are patterns of their own
and have a module each: a View subclass whose `Template` builds the screen and
whose `Behavior` handles the buttons. Back pops a window, and on the main menu
Back is left unhandled so the firmware closes the app, as the C app does.

Clone with the submodule: `git clone --recurse-submodules`, or `git submodule
update --init` after the fact.

## Building and running

```sh
pebble build
pebble install --emulator emery          # or gabbro
pebble install --emulator emery --logs   # console.log lines show as xsHost.c
pebble screenshot --no-open --emulator emery out.png
pebble emu-button --emulator emery click down   # back, up, select, down
pebble install --phone <ip>
```

## Memory

The JavaScript machine runs with `stack 5120, slot 45056, chunk 21504`
(`src/c/mdbl.c`, mirrored in `src/embeddedjs/manifest.json`); the Piu display
and command lists are 1024 bytes each (`main.js`). In the emulator the compiled
JavaScript (`build/mods/emery/mc.xsa`, 42.2 kB) is copied into the same 122 kB
app heap as those pools, and this app, which opens every widget the library has,
sits within a kilobyte of it: a bigger slot heap stopped the archive from
mapping (`fxMapArchive failed`), a smaller one ran out after the tenth window
(every imported module stays resident), the default 32 kB machine aborts at
launch, a 4096 stack overflows, and a 20480 chunk heap fails on the last dialog.
On the watch the archive is read from flash, so there is 40 kB more room than
here. Bitmaps are loaded per window instance, so only the open windows' GBitmaps
are in the heap.

## Piu on Pebble, as found here

- A template called as a property (`$.Item(...)`) takes `$` as its `this`;
  call it with `new`.
- `Port.onDraw(port, x, y, w, h)` receives the area to redraw; the port's own
  size is `port.width` and `port.height`.
- `Port.drawString` draws from the given point whatever the style's alignment
  and margins say; centre with `style.measure(text).width`.
- Piu draws a Pebble font (cap offset − 1) px above where `graphics_draw_text`
  puts it for the same y. `TEXT_TOP_INSET` in `assets.js` holds the measured
  top margins (4 for Gothic 14, 14 Bold and 24 Bold; 2 for 18 and 18 Bold;
  5 for 28 Bold) that put the glyphs where a TextLayer has them.
- `distribute()` reaches the children before the container, so a view that
  focuses itself in `onDisplayed` takes the buttons away from its menu; such
  views focus the menu instead.
- On emery and gabbro the firmware's TextLayer default font is Gothic 18 Bold
  and the status bar's is Gothic 18 (the SDK's Gothic 14 scaled for the
  display), `ACTION_BAR_WIDTH` is 34 and 40, `STATUS_BAR_LAYER_HEIGHT` is 20.
- MenuLayer on a rectangular display centres the selected cell once it passes
  the middle, and scrolls up to 20 px past the last cell; on round the selected
  cell is 68 px and the others 32 px, always centred, titles centred.
- `graphics_draw_circle` and `graphics_fill_circle` are anti-aliased on these
  displays; the radio buttons use their coverage tables, sampled from the C app.
- A RoundRect of width 0 still paints two pixels.
