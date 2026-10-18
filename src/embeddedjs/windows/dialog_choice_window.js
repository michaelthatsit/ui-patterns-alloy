// Example implementation of the dialog choice UI pattern.
import { ROUND, PBL_IF_COLOR_ELSE, PBL_IF_ROUND_ELSE, ACTION_BAR_WIDTH, GColor, FONT_KEY, RESOURCE_ID, bitmapSkin, textLayerStyle, skins } from "assets";
import View from "piu/View";

export const DIALOG_CHOICE_WINDOW_MESSAGE = "Set as default?";

const labelStyle = textLayerStyle(FONT_KEY.GOTHIC_24_BOLD, GColor.Black, "center");

// Where ActionBarLayer puts its up and down icons, measured on the emulators.
const ICON_LEFT = PBL_IF_ROUND_ELSE(10, 9);
const ICON_TOP = PBL_IF_ROUND_ELSE(80, 45);
// On round the bar's inner edge is an arc: a circle of this radius, centred
// ACTION_BAR_WIDTH short of the right edge plus the radius, anti-aliased
// (fitted to the C app on the gabbro emulator; the edge pixel is blended in
// the display's four levels per channel).
const ROUND_BAR_RADIUS = 274.4;
const BACKGROUND_LEVELS = PBL_IF_COLOR_ELSE([0, 2, 1] /* JaegerGreen */, [3, 3, 3] /* White */);

function blend(levels, coverage) {
	let color = "#";
	for (const level of levels) {
		const value = Math.round(level * (1 - coverage)) * 85;
		color += (value < 16 ? "0" : "") + value.toString(16);
	}
	return color;
}

class RoundActionBarBehavior extends Behavior {
	onDraw(port) {
		const width = port.width, height = port.height;
		const cx = width - ACTION_BAR_WIDTH + ROUND_BAR_RADIUS, cy = height / 2;
		for (let row = 0; row < height; row++) {
			const dy = row + 0.5 - cy;
			const edge = cx - Math.sqrt(ROUND_BAR_RADIUS * ROUND_BAR_RADIUS - dy * dy);
			const left = Math.ceil(edge);
			if (left >= width)
				continue;
			port.fillColor(GColor.Black, left, row, width - left, 1);
			const coverage = left - edge;
			if (coverage > 0)
				port.fillColor(blend(BACKGROUND_LEVELS, coverage), left - 1, row, 1, 1);
		}
	}
}

const DialogChoiceContainer = Container.template($ => ({
	skin: new Skin({ fill: PBL_IF_COLOR_ELSE(GColor.JaegerGreen, GColor.White) }), Behavior: $.constructor.Behavior,
	contents: [
		// The icon, centred in the bounds inset {top 7, right 28, bottom 56, left 14} (a BitmapLayer
		// aligns centre, rounding down; Piu would round the vertical centre up).
		Container($, { left: 14, top: 7, right: 28, bottom: 56, contents: [
			Content($, { top: (screen.height - 7 - 56 - $.confirmSkin.height) >> 1, skin: $.confirmSkin }),
		] }),
		Label($, { left: ACTION_BAR_WIDTH >> 1, right: ACTION_BAR_WIDTH, top: 112, bottom: 0, style: labelStyle, string: DIALOG_CHOICE_WINDOW_MESSAGE }),
		// The action bar with the tick on Up and the cross on Down.
		ROUND
			? Port($, { left: 0, right: 0, top: 0, bottom: 0, Behavior: RoundActionBarBehavior })
			: Content($, { right: 0, top: 0, bottom: 0, width: ACTION_BAR_WIDTH, skin: skins.black }),
		Content($, { right: ACTION_BAR_WIDTH - ICON_LEFT - $.tickSkin.width, top: ICON_TOP, skin: $.tickSkin }),
		Content($, { right: ACTION_BAR_WIDTH - ICON_LEFT - $.crossSkin.width, bottom: ICON_TOP, skin: $.crossSkin }),
	],
}));

export default class DialogChoiceWindow extends View {
	constructor(data) {
		super(data);
		// Loaded with the window (window_load), freed with it: bitmaps take app heap.
		this.confirmSkin = bitmapSkin(RESOURCE_ID.CONFIRM);
		this.tickSkin = bitmapSkin(RESOURCE_ID.TICK);
		this.crossSkin = bitmapSkin(RESOURCE_ID.CROSS);
	}
	get Template() { return DialogChoiceContainer }
}
