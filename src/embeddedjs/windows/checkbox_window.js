// Example implementation of the checkbox list UI pattern.
import { RESOURCE_ID, GColor, bitmapSkin } from "assets";
import Menu, { MenuTitle, MenuItem } from "Menu";

export const CHECKBOX_WINDOW_NUM_ROWS = 4;
export const CHECKBOX_WINDOW_BOX_SIZE = 12;
export const CHECKBOX_WINDOW_CELL_HEIGHT = 44;

const BOX = CHECKBOX_WINDOW_BOX_SIZE;
const selections = new Array(CHECKBOX_WINDOW_NUM_ROWS).fill(false);
const boxSkin = new Skin({ fill: GColor.Clear, stroke: [GColor.Black, GColor.White], borders: { left: 1, right: 1, top: 1, bottom: 1 } });

class ChoiceRowBehavior extends Behavior {
	onCreate(row, $) {
		this.index = $.index;
	}
	// The tick is black, or white on the highlighted row.
	onReload(row, highlighted) {
		const checked = selections[this.index];
		const box = row.last;
		box.content(1).visible = checked && !highlighted;
		box.content(2).visible = checked && highlighted;
	}
}

// A choice row: the title, and at the right the 12 px box, vertically centred
// at x = width - 2 * box size, with the 16 px tick 3 px above the box's top.
const ChoiceRow = Container.template($ => ({
	left: 0, right: 0, Behavior: ChoiceRowBehavior,
	contents: [
		MenuTitle($),
		Container($, {
			right: 2 * BOX - $.menu.tickBlackSkin.width, width: $.menu.tickBlackSkin.width, height: BOX + 6,
			contents: [
				Content($, { left: 0, top: 3, width: BOX, height: BOX, skin: boxSkin }),
				Content($, { left: 0, top: 0, skin: $.menu.tickBlackSkin, visible: false }),
				Content($, { left: 0, top: 0, skin: $.menu.tickWhiteSkin, visible: false }),
			],
		}),
	],
}));

function CheckboxItem($, it) {
	return $.index < CHECKBOX_WINDOW_NUM_ROWS ? ChoiceRow($, it) : MenuItem($, it);
}

class CheckboxWindowBehavior extends Menu.Behavior {
	onSelect(menu, index) {
		if (index === CHECKBOX_WINDOW_NUM_ROWS) {
			// Do something with choices made
			for (let i = 0; i < CHECKBOX_WINDOW_NUM_ROWS; i++)
				console.log(`Option ${i} was ${selections[i] ? "selected" : "not selected"}`);
			controller.goBack();
		}
		else {
			// Check/uncheck
			selections[index] = !selections[index];
			this.reload(menu);
		}
		return true;
	}
}

export default class CheckboxWindow extends Menu {
	static get Behavior() { return CheckboxWindowBehavior }
	constructor(data) {
		const items = Array.from({ length: CHECKBOX_WINDOW_NUM_ROWS }, (_, i) => ({ title: `Choice ${i}` }));
		items.push({ title: "Submit" });
		super({ items, cellHeight: CHECKBOX_WINDOW_CELL_HEIGHT, Item: CheckboxItem });
		this.data = data;
		// Loaded with the window (window_load), freed with it: bitmaps take app heap.
		this.tickBlackSkin = bitmapSkin(RESOURCE_ID.TICK_BLACK);
		this.tickWhiteSkin = bitmapSkin(RESOURCE_ID.TICK_WHITE);
	}
}
