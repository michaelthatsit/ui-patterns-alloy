// The main menu: one row per UI pattern. Six of the patterns are pebble-ui
// windows and need only their data; the other four have modules under windows/.
import { PBL_IF_COLOR_ELSE, GColor } from "pebble-ui/sdk";
import { RESOURCE_ID } from "assets";
import Menu from "pebble-ui/Menu";
import { CheckboxList, RadioList } from "pebble-ui/lists";
import { MessageDialog, ChoiceDialog, ConfigDialog } from "pebble-ui/dialogs";
import PinWindow from "pebble-ui/PinWindow";
import WindowStack from "pebble-ui/WindowStack";

const pop = () => WindowStack.current.pop();

// Checkbox list: the choices persist across openings, as the C window's statics do.
const CHECKBOX_WINDOW_NUM_ROWS = 4;
const checkboxSelections = new Array(CHECKBOX_WINDOW_NUM_ROWS).fill(false);
const checkboxList = {
	items: Array.from({ length: CHECKBOX_WINDOW_NUM_ROWS }, (_, i) => `Choice ${i}`),
	checked: checkboxSelections,
	onChange(index, checked) {
		checkboxSelections[index] = checked;
	},
	onSubmit(checked) {
		// Do something with choices made
		for (let i = 0; i < CHECKBOX_WINDOW_NUM_ROWS; i++)
			console.log(`Option ${i} was ${checked[i] ? "selected" : "not selected"}`);
		pop();
	},
};

// Radio button list
const RADIO_BUTTON_WINDOW_NUM_ROWS = 4;
let radioSelection = 0;
const radioList = {
	items: Array.from({ length: RADIO_BUTTON_WINDOW_NUM_ROWS }, (_, i) => `Choice ${i}`),
	get choice() { return radioSelection; },
	onChange(index) {
		radioSelection = index;
	},
	onSubmit(choice) {
		// Do something with user choice
		console.log(`Submitted choice ${choice}`);
		pop();
	},
};

const WINDOWS = [
	{ title: "Checkbox List", View: CheckboxList, data: checkboxList },
	{ title: "Choice Dialog", View: ChoiceDialog, data: { icon: RESOURCE_ID.CONFIRM, text: "Set as default?", up: RESOURCE_ID.TICK, down: RESOURCE_ID.CROSS } },
	{ title: "Message Dialog", View: MessageDialog, data: { icon: RESOURCE_ID.WARNING, text: "Battery is low! Connect the charger." } },
	{ title: "List Message", View: "list_message_window" },
	{ title: "Radio Button", View: RadioList, data: radioList },
	{ title: "PIN Entry", View: PinWindow, data: { onComplete(pin) { console.log(`Pin was ${pin[0]} ${pin[1]} ${pin[2]}`); pop(); } } },
	{ title: "Text Animation", View: "text_animation_window" },
	{ title: "Progress Bar", View: "progress_bar_window" },
	{ title: "Progress Layer", View: "progress_layer_window" },
	{ title: "App Config Prompt", View: ConfigDialog, data: { icon: RESOURCE_ID.CONFIG_REQUIRED, title: "Example App", body: "Set up in the\nPebble app" } },
];

export default class MainWindow extends Menu {
	constructor() {
		super({
			items: WINDOWS,
			normal: PBL_IF_COLOR_ELSE([GColor.Black, GColor.White], [GColor.White, GColor.Black]),
			highlight: PBL_IF_COLOR_ELSE([GColor.Red, GColor.White], [GColor.Black, GColor.White]),
			onSelect(index, item) {
				WindowStack.current.push(item.View, item.data);
			},
		});
	}
}
