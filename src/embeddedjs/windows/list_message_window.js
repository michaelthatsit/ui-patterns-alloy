// Example implementation of the list menu UI pattern: a menu in the top 150 px
// and a hint under it (a TextLayer with its default font, Gothic 18 Bold on
// these displays, on white).
import { GColor, FONT_KEY, textLayerStyle, solidSkin } from "pebble-ui/sdk";
import Menu from "pebble-ui/Menu";
import View from "pebble-ui/View";

const LIST_MESSAGE_WINDOW_NUM_ROWS = 5;
const LIST_MESSAGE_WINDOW_CELL_HEIGHT = 30;
const LIST_MESSAGE_WINDOW_MENU_HEIGHT = LIST_MESSAGE_WINDOW_NUM_ROWS * LIST_MESSAGE_WINDOW_CELL_HEIGHT;
const LIST_MESSAGE_WINDOW_HINT_TEXT = "Your list items";

const whiteSkin = solidSkin(GColor.White);
const hintStyle = textLayerStyle(FONT_KEY.GOTHIC_18_BOLD, GColor.Black, "center");

class ListMessageBehavior extends View.Behavior {
	// The menu takes the buttons.
	onDisplayed(container) {
		container.first.focus();
	}
}

const ListMessageContainer = Container.template($ => ({
	skin: whiteSkin, Behavior: $.constructor.Behavior,
	contents: [
		new $.menu.Template($.menu, { left: 0, right: 0, top: 0, height: LIST_MESSAGE_WINDOW_MENU_HEIGHT }),
		Label($, { left: 0, right: 0, top: 140, bottom: 0, skin: whiteSkin, style: hintStyle, string: LIST_MESSAGE_WINDOW_HINT_TEXT }),
	],
}));

export default class ListMessageWindow extends View {
	static get Behavior() { return ListMessageBehavior }
	constructor(data) {
		super(data);
		this.menu = new Menu({
			items: Array.from({ length: LIST_MESSAGE_WINDOW_NUM_ROWS }, (_, i) => `Item ${i}`),
			cellHeight: LIST_MESSAGE_WINDOW_CELL_HEIGHT,
			onSelect() {},
		});
	}
	get Template() { return ListMessageContainer }
}
