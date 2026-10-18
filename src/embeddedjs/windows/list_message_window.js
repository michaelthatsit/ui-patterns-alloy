// Example implementation of the list menu UI pattern.
import { GColor, FONT_KEY, textLayerStyle, skins } from "assets";
import Menu from "Menu";
import View from "piu/View";

export const LIST_MESSAGE_WINDOW_NUM_ROWS = 5;
export const LIST_MESSAGE_WINDOW_CELL_HEIGHT = 30;
export const LIST_MESSAGE_WINDOW_MENU_HEIGHT = LIST_MESSAGE_WINDOW_NUM_ROWS * LIST_MESSAGE_WINDOW_CELL_HEIGHT;
export const LIST_MESSAGE_WINDOW_HINT_TEXT = "Your list items";

// A TextLayer's default font: Gothic 18 Bold on emery and gabbro (measured; the
// firmware scales the SDK's Gothic 14 Bold default for the larger displays).
const hintStyle = textLayerStyle(FONT_KEY.GOTHIC_18_BOLD, GColor.Black, "center");

class ListMessageBehavior extends View.Behavior {
	// The menu takes the buttons (distribute reaches the children first, so the view must not take focus after it).
	onDisplayed(container) {
		container.first.focus();
	}
}

// The menu in the top 150 px, and the hint (a TextLayer, so on white) inset 140 px from the top.
const ListMessageContainer = Container.template($ => ({
	skin: skins.white, Behavior: $.constructor.Behavior,
	contents: [
		new $.menu.Template($.menu, { left: 0, right: 0, top: 0, height: LIST_MESSAGE_WINDOW_MENU_HEIGHT }),
		Label($, { left: 0, right: 0, top: 140, bottom: 0, skin: skins.white, style: hintStyle, string: LIST_MESSAGE_WINDOW_HINT_TEXT }),
	],
}));

export default class ListMessageWindow extends View {
	static get Behavior() { return ListMessageBehavior }
	constructor(data) {
		super(data);
		this.menu = new Menu({
			items: Array.from({ length: LIST_MESSAGE_WINDOW_NUM_ROWS }, (_, i) => ({ title: `Item ${i}` })),
			cellHeight: LIST_MESSAGE_WINDOW_CELL_HEIGHT,
		});
	}
	get Template() { return ListMessageContainer }
}
