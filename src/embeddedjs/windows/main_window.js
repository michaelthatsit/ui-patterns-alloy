// The main menu: one row per UI pattern.
import { PBL_IF_COLOR_ELSE, GColor, MENU_CELL_BASIC_CELL_HEIGHT } from "assets";
import Menu from "Menu";

const WINDOWS = [
	{ title: "Checkbox List", id: "checkbox_window" },
	{ title: "Choice Dialog", id: "dialog_choice_window" },
	{ title: "Message Dialog", id: "dialog_message_window" },
	{ title: "List Message", id: "list_message_window" },
	{ title: "Radio Button", id: "radio_button_window" },
	{ title: "PIN Entry", id: "pin_window" },
	{ title: "Text Animation", id: "text_animation_window" },
	{ title: "Progress Bar", id: "progress_bar_window" },
	{ title: "Progress Layer", id: "progress_layer_window" },
	{ title: "App Config Prompt", id: "dialog_config_window" },
];

function pinComplete(pin) {
	console.log(`Pin was ${pin[0]} ${pin[1]} ${pin[2]}`);
	controller.goBack();
}

class MainWindowBehavior extends Menu.Behavior {
	onSelect(menu, index, item) {
		controller.goTo(item.id, item.id === "pin_window" ? { onComplete: pinComplete } : undefined);
		return true;
	}
}

export default class MainWindow extends Menu {
	static get Behavior() { return MainWindowBehavior }
	constructor(data) {
		super({
			items: WINDOWS,
			cellHeight: MENU_CELL_BASIC_CELL_HEIGHT,
			normal: PBL_IF_COLOR_ELSE([GColor.Black, GColor.White], [GColor.White, GColor.Black]),
			highlight: PBL_IF_COLOR_ELSE([GColor.Red, GColor.White], [GColor.Black, GColor.White]),
		});
		this.data = data;
	}
}
