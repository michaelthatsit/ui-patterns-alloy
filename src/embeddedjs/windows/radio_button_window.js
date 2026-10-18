// Example implementation of the radio button list UI pattern.
import { GColor } from "assets";
import Menu, { MenuTitle, MenuItem } from "Menu";

export const RADIO_BUTTON_WINDOW_NUM_ROWS = 4;
export const RADIO_BUTTON_WINDOW_CELL_HEIGHT = 44;
export const RADIO_BUTTON_WINDOW_RADIO_RADIUS = 6;

const RADIUS = RADIO_BUTTON_WINDOW_RADIO_RADIUS;
const DIAMETER = 2 * RADIUS + 1; // graphics_draw_circle covers the centre pixel and radius on each side
let currentSelection = 0;

class ChoiceRowBehavior extends Behavior {
	onCreate(row, $) {
		this.index = $.index;
	}
	onReload(row, highlighted) {
		const radio = row.last.first;
		radio.behavior.highlighted = highlighted;
		radio.behavior.selected = this.index === currentSelection;
		radio.invalidate();
	}
}

// The radio, as graphics_draw_circle(radius 6) and graphics_fill_circle(radius 3)
// draw it on a colour display: anti-aliased, in the four grey levels the
// display has. These are their coverage tables, sampled from the C app on the
// emery emulator (0: none, 3: full), drawn in white on the highlighted row.
const RING = [
	"0001233321000",
	"0032100012300",
	"0210000000120",
	"1200000000021",
	"2100000000012",
	"3000000000003",
	"3000000000003",
	"3000000000003",
	"2100000000012",
	"1200000000021",
	"0210000000120",
	"0032100012300",
	"0001233321000",
];
const DOT = [
	"0033300",
	"1333331",
	"2333332",
	"3333333",
	"2333332",
	"1333331",
	"0033300",
];
const INK_LEVELS = ["#FFFFFF", "#AAAAAA", "#555555", "#000000"];
const PAPER_LEVELS = ["#000000", "#555555", "#AAAAAA", "#FFFFFF"];

class RadioBehavior extends Behavior {
	onCreate(port) {
		this.highlighted = false;
		this.selected = false;
	}
	onDraw(port) {
		const levels = this.highlighted ? PAPER_LEVELS : INK_LEVELS;
		this.table(port, levels, RING, 0, 0);
		if (this.selected)
			this.table(port, levels, DOT, RADIUS - 3, RADIUS - 3);
	}
	table(port, levels, rows, left, top) {
		for (let y = 0; y < rows.length; y++) {
			const row = rows[y];
			for (let x = 0; x < row.length; x++) {
				const level = row.charCodeAt(x) - 48;
				if (level)
					port.fillColor(levels[level], left + x, top + y, 1, 1);
			}
		}
	}
}

// A choice row: the title, and the radio of radius 6 centred at
// (width - 3 * radius, height / 2), filled to radius 3 when it is the selection.
const ChoiceRow = Container.template($ => ({
	left: 0, right: 0, Behavior: ChoiceRowBehavior,
	contents: [
		MenuTitle($),
		Container($, {
			right: 4 * RADIUS - DIAMETER, width: DIAMETER, height: DIAMETER + 1,
			contents: [
				Port($, { left: 0, top: 1, width: DIAMETER, height: DIAMETER, Behavior: RadioBehavior }),
			],
		}),
	],
}));

function RadioItem($, it) {
	return $.index < RADIO_BUTTON_WINDOW_NUM_ROWS ? ChoiceRow($, it) : MenuItem($, it);
}

class RadioButtonWindowBehavior extends Menu.Behavior {
	onSelect(menu, index) {
		if (index === RADIO_BUTTON_WINDOW_NUM_ROWS) {
			// Do something with user choice
			console.log(`Submitted choice ${currentSelection}`);
			controller.goBack();
		}
		else {
			// Change selection
			currentSelection = index;
			this.reload(menu);
		}
		return true;
	}
}

export default class RadioButtonWindow extends Menu {
	static get Behavior() { return RadioButtonWindowBehavior }
	constructor(data) {
		const items = Array.from({ length: RADIO_BUTTON_WINDOW_NUM_ROWS }, (_, i) => ({ title: `Choice ${i}` }));
		items.push({ title: "Submit" });
		super({ items, cellHeight: RADIO_BUTTON_WINDOW_CELL_HEIGHT, Item: RadioItem });
		this.data = data;
	}
}
