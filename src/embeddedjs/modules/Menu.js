// A MenuLayer: rows in a Column behind a highlight bar, Up/Down move the
// selection (repeating while held), Select bubbles onSelect(index, item).
// Geometry measured against the C SDK's MenuLayer on the emery and gabbro
// emulators:
// - rect: cells are cellHeight tall; once the selected cell's centre passes
//   the view's centre the list scrolls to keep it centred, up to 20 px past
//   the last cell (BOTTOM_PADDING);
// - round: the selected cell is 68 px, the others 32 px, the selected cell is
//   always centred and titles are centred (MenuLayer's center-focused mode);
// - menu_cell_basic_draw puts the title (Gothic 24 Bold) in a 34 px box
//   centred in the cell, inset 10 px on rect.
// A highlighted row and everything in it get state 1, so skins and styles with
// [normal, highlighted] colours switch by themselves; rows also get
// onReload(row, highlighted, height) to redraw their accessories.
import {
	ROUND, GColor, FONT_KEY, TEXT_TOP_INSET,
	MENU_CELL_BASIC_CELL_HEIGHT,
	MENU_CELL_ROUND_FOCUSED_SHORT_CELL_HEIGHT as FOCUSED,
	MENU_CELL_ROUND_UNFOCUSED_TALL_CELL_HEIGHT as UNFOCUSED,
} from "assets";
import Timer from "timer";
import View from "piu/View";

const BOTTOM_PADDING = 20;
const TITLE_BOX = 34;
const TITLE_INSET = 10;
const ANIMATION_MS = 100;
const REPEAT_DELAY_MS = 400;
const REPEAT_MS = 100;

const titleFontHeight = new Style({ font: FONT_KEY.GOTHIC_24_BOLD }).measure("0").height;

class MenuBehavior extends View.Behavior {
	onDisplaying(menu) {
		this.place(menu, false);
	}
	onUndisplaying(menu) {
		this.release(menu);
		super.onUndisplaying(menu);
	}
	rowHeight(index) {
		const view = this.view;
		if (ROUND)
			return index === view.selection ? FOCUSED : UNFOCUSED;
		return view.cellHeight;
	}
	// Lays the rows out for the current selection (menu_layer_reload_data when not animated).
	place(menu, animate) {
		const view = this.view;
		const column = menu.last;
		const selection = view.selection;
		let y = 0, selectionTop = 0, selectionHeight = 0, index = 0;
		for (let row = column.first; row; row = row.next, index++) {
			const height = this.rowHeight(index);
			if (row.coordinates.height !== height)
				row.coordinates = { left: 0, right: 0, height };
			const highlighted = index === selection;
			if (highlighted) {
				selectionTop = y;
				selectionHeight = height;
			}
			y += height;
			this.setState(row, highlighted ? 1 : 0);
			row.delegate("onReload", highlighted, height);
		}
		const viewHeight = menu.height || menu.coordinates.height;
		const scroll = ROUND
			? selectionTop - ((viewHeight - selectionHeight) >> 1)
			: Math.max(0, Math.min(selectionTop + (selectionHeight >> 1) - (viewHeight >> 1), y + BOTTOM_PADDING - viewHeight));
		this.to = { column: -scroll, bar: selectionTop - scroll, height: selectionHeight };
		if (animate) {
			const bar = menu.first;
			this.from = { column: column.coordinates.top, bar: bar.coordinates.top, height: bar.coordinates.height };
			menu.duration = ANIMATION_MS;
			menu.time = 0;
			menu.start();
		}
		else
			this.apply(menu, 1);
	}
	apply(menu, fraction) {
		const to = this.to, from = this.from ?? to;
		const at = (key) => Math.round(from[key] + (to[key] - from[key]) * fraction);
		menu.last.coordinates = { left: 0, right: 0, top: at("column") };
		menu.first.coordinates = { left: 0, right: 0, top: at("bar"), height: at("height") };
	}
	onTimeChanged(menu) {
		this.apply(menu, Math.quadEaseOut(menu.fraction));
	}
	onFinished(menu) {
		this.apply(menu, 1);
	}
	setState(content, state) {
		content.state = state;
		if (content instanceof Container)
			for (let child = content.first; child; child = child.next)
				this.setState(child, state);
	}
	step(menu, direction) {
		const view = this.view;
		const selection = Math.max(0, Math.min(view.items.length - 1, view.selection + direction));
		if (selection === view.selection)
			return;
		view.selection = selection;
		if (menu.running)
			menu.stop();
		this.place(menu, true);
	}
	press(menu, direction) {
		this.step(menu, direction);
		this.timer = Timer.set(() => this.step(menu, direction), REPEAT_DELAY_MS, REPEAT_MS);
		return true;
	}
	release(menu) {
		if (this.timer !== undefined) {
			Timer.clear(this.timer);
			this.timer = undefined;
		}
		return true;
	}
	onPressUp(menu) {
		return this.press(menu, -1);
	}
	onPressDown(menu) {
		return this.press(menu, 1);
	}
	onReleaseUp(menu) {
		return this.release(menu);
	}
	onReleaseDown(menu) {
		return this.release(menu);
	}
	onPressSelect(menu) {
		const view = this.view;
		menu.bubble("onSelect", view.selection, view.items[view.selection]);
		return true;
	}
	// menu_layer_reload_data
	reload(menu) {
		this.place(menu, false);
	}
}

// The title of a basic cell; $ is the row's data: { menu, item, index }.
export const MenuTitle = Label.template($ => ({
	left: 0, right: 0, top: 0, bottom: 0, style: $.menu.titleStyle, string: $.item.title,
}));

export const MenuItem = Container.template($ => ({
	left: 0, right: 0,
	contents: [
		MenuTitle($),
	],
}));

const MenuContainer = Container.template($ => ({
	clip: true, skin: $.skins.normal, Behavior: $.constructor.Behavior,
	contents: [
		Content($, { left: 0, right: 0, top: 0, height: 0, skin: $.skins.highlight }),
		Column($, {
			left: 0, right: 0, top: 0,
			// `new`: a template called as a property of $ would take $ as its `this`.
			contents: $.items.map((item, index) => new $.Item({ menu: $, item, index }, { height: ROUND ? (index === $.selection ? FOCUSED : UNFOCUSED) : $.cellHeight })),
		}),
	],
}));

// data: { items: [{ title, ... }], cellHeight?, Item?, normal?: [background, foreground], highlight?: [background, foreground], selection? }
export default class MenuView extends View {
	static get Behavior() { return MenuBehavior }
	constructor(data) {
		super(data);
		this.items = data.items;
		this.selection = data.selection ?? 0;
		this.cellHeight = data.cellHeight ?? MENU_CELL_BASIC_CELL_HEIGHT;
		this.Item = data.Item ?? MenuItem;
		const normal = data.normal ?? [GColor.White, GColor.Black];
		const highlight = data.highlight ?? [GColor.Black, GColor.White];
		this.skins = {
			normal: new Skin({ fill: normal[0] }),
			highlight: new Skin({ fill: highlight[0] }),
		};
		this.titleStyle = new Style({
			font: FONT_KEY.GOTHIC_24_BOLD, color: [normal[1], highlight[1]],
			horizontal: ROUND ? "center" : "left", left: ROUND ? 0 : TITLE_INSET,
			vertical: "middle", top: TEXT_TOP_INSET[FONT_KEY.GOTHIC_24_BOLD], bottom: TITLE_BOX - titleFontHeight - TEXT_TOP_INSET[FONT_KEY.GOTHIC_24_BOLD],
		});
	}
	get Template() { return MenuContainer }
}
