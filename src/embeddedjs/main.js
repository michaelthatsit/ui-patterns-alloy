// UI Patterns, after pebble-examples/ui-patterns, on pebble-ui (Piu). The
// window stack is the application's behavior; each window is a module under
// windows/, opened from the main menu by name.
import WindowStack from "pebble-ui/WindowStack";

const UIPatternsApplication = Application.template($ => ({
	behavior: new WindowStack,
}));

export default new UIPatternsApplication(
	{ View: "main_window" },
	{ commandListLength: 1024, displayListLength: 1024, touchCount: 0, pixels: screen.width * 4 },
);
