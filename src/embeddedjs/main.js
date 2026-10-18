// UI Patterns, after pebble-examples/ui-patterns, in Alloy (Piu). The
// controller keeps the window stack; each window is a module under windows/.
import Controller from "piu/Controller";

globalThis.controller = new Controller;

const UIPatternsApplication = Application.template($ => ({
	behavior: globalThis.controller,
}));

export default new UIPatternsApplication(
	{ home: { View: "main_window" } },
	{ commandListLength: 2048, displayListLength: 2048, touchCount: 0, pixels: screen.width * 4 },
);
