// The C SDK's platform defines (values for emery and gabbro), resource IDs,
// colours and fonts used by the windows. Resource IDs follow the order of
// resources.media in package.json (IDs start at 1; the compiled JS comes after).
export const ROUND = screen.round;
export const COLOR = screen.color;
export const PBL_IF_COLOR_ELSE = (color, bw) => COLOR ? color : bw;
export const PBL_IF_ROUND_ELSE = (round, rect) => ROUND ? round : rect;

export const ACTION_BAR_WIDTH = PBL_IF_ROUND_ELSE(40, 34);
export const STATUS_BAR_LAYER_HEIGHT = 20;
export const MENU_CELL_BASIC_CELL_HEIGHT = 44;
export const MENU_CELL_ROUND_FOCUSED_SHORT_CELL_HEIGHT = 68;
export const MENU_CELL_ROUND_UNFOCUSED_TALL_CELL_HEIGHT = 32;

export const RESOURCE_ID = Object.freeze({
	TICK_BLACK: 1, TICK_WHITE: 2, CONFIRM: 3, CROSS: 4, TICK: 5, WARNING: 6, CONFIG_REQUIRED: 7,
});

export const GColor = Object.freeze({
	Clear: "transparent",
	Black: "#000000",
	White: "#FFFFFF",
	Red: "#FF0000",
	DarkGray: "#555555",
	LightGray: "#AAAAAA",
	JaegerGreen: "#00AA55",
	Yellow: "#FFFF00",
	BlueMoon: "#0055FF",
	DarkCandyAppleRed: "#AA0000",
});

export const FONT_KEY = Object.freeze({
	GOTHIC_14: "14px Gothic",
	GOTHIC_14_BOLD: "bold 14px Gothic",
	GOTHIC_18: "18px Gothic",
	GOTHIC_18_BOLD: "bold 18px Gothic",
	GOTHIC_24_BOLD: "bold 24px Gothic",
	GOTHIC_28_BOLD: "bold 28px Gothic",
});

// Piu draws a Pebble font (cap offset - 1) px above where graphics_draw_text
// puts it for the same y (piuView.c, PiuViewDrawString). This margin puts the
// glyphs back where a TextLayer has them; measured against the C app.
export const TEXT_TOP_INSET = Object.freeze({
	[FONT_KEY.GOTHIC_14]: 4,
	[FONT_KEY.GOTHIC_14_BOLD]: 4,
	[FONT_KEY.GOTHIC_18]: 2,
	[FONT_KEY.GOTHIC_18_BOLD]: 2,
	[FONT_KEY.GOTHIC_24_BOLD]: 4,
	[FONT_KEY.GOTHIC_28_BOLD]: 5,
});

// A TextLayer's text: the text box starts at the content's top edge, as graphics_draw_text draws it.
export function textLayerStyle(font, color = GColor.Black, horizontal = "left") {
	return new Style({ font, color, horizontal, vertical: "top", top: TEXT_TOP_INSET[font] });
}

// A GBitmap resource as a skin of its own size (drawn with GCompOpSet, so transparency is kept).
export function bitmapSkin(id) {
	const texture = new Texture(id);
	return new Skin({ texture, width: texture.width, height: texture.height });
}

export const skins = Object.freeze({
	black: new Skin({ fill: GColor.Black }),
	white: new Skin({ fill: GColor.White }),
});
