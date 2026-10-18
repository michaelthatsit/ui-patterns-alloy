// Example implementation of the 'config required' dialog UI pattern.
import { PBL_IF_COLOR_ELSE, GColor, FONT_KEY, RESOURCE_ID, bitmapSkin, textLayerStyle } from "assets";
import View from "piu/View";

export const DIALOG_CONFIG_WINDOW_APP_NAME = "Example App";
export const DIALOG_CONFIG_WINDOW_MESSAGE = "Set up in the\nPebble app";

const textColor = PBL_IF_COLOR_ELSE(GColor.White, GColor.Black);
const titleStyle = textLayerStyle(FONT_KEY.GOTHIC_24_BOLD, textColor, "center");
const bodyStyle = textLayerStyle(FONT_KEY.GOTHIC_18_BOLD, textColor, "center");

const DialogConfigContainer = Container.template($ => ({
	skin: new Skin({ fill: PBL_IF_COLOR_ELSE(GColor.DarkGray, GColor.White) }), Behavior: $.constructor.Behavior,
	contents: [
		// Centred, rounding down as a BitmapLayer does (Piu would round the vertical centre up).
		Content($, { top: (screen.height - $.iconSkin.height) >> 1, skin: $.iconSkin }),
		Label($, { left: 0, right: 0, top: 10, bottom: 0, style: titleStyle, string: DIALOG_CONFIG_WINDOW_APP_NAME }),
		Text($, { left: 5, right: 5, top: 125, bottom: 0, style: bodyStyle, string: DIALOG_CONFIG_WINDOW_MESSAGE }),
	],
}));

export default class DialogConfigWindow extends View {
	constructor(data) {
		super(data);
		// Loaded with the window (window_load), freed with it: bitmaps take app heap.
		this.iconSkin = bitmapSkin(RESOURCE_ID.CONFIG_REQUIRED);
	}
	get Template() { return DialogConfigContainer }
}
