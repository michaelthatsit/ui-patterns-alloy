// Example implementation of the dialog message UI pattern.
import { PBL_IF_COLOR_ELSE, PBL_IF_ROUND_ELSE, GColor, FONT_KEY, RESOURCE_ID, bitmapSkin, textLayerStyle, skins } from "assets";
import Timeline from "piu/Timeline";
import View from "piu/View";

export const DIALOG_MESSAGE_WINDOW_MESSAGE = "Battery is low! Connect the charger.";
export const DIALOG_MESSAGE_WINDOW_MARGIN = 10;

const MARGIN = DIALOG_MESSAGE_WINDOW_MARGIN;
const APPEAR_DELAY_MS = 700;
const APPEAR_DURATION_MS = 250; // the default animation duration

const backgroundSkin = new Skin({ fill: PBL_IF_COLOR_ELSE(GColor.Yellow, GColor.White) });
const labelStyle = textLayerStyle(FONT_KEY.GOTHIC_24_BOLD, GColor.Black, PBL_IF_ROUND_ELSE("center", "left"));

class DialogMessageBehavior extends View.Behavior {
	// window_appear: the background, icon and label start below the screen and slide up together.
	onDisplaying(container) {
		const y = container.y;
		const background = container.first, icon = background.next, label = icon.next;
		const iconSkin = this.view.iconSkin;
		const timeline = this.timeline = new Timeline();
		timeline.to(background, { y }, APPEAR_DURATION_MS, Math.quadEaseInOut, APPEAR_DELAY_MS);
		timeline.to(icon, { y: y + MARGIN }, APPEAR_DURATION_MS, Math.quadEaseInOut, APPEAR_DELAY_MS);
		timeline.to(label, { y: y + MARGIN + iconSkin.height + 5 /* small adjustment */ }, APPEAR_DURATION_MS, Math.quadEaseInOut, APPEAR_DELAY_MS);
		container.duration = timeline.duration;
		timeline.seekTo(0);
		container.time = 0;
		container.start();
	}
	onTimeChanged(container) {
		this.timeline.seekTo(container.time);
	}
	onUndisplaying(container) {
		container.stop();
		super.onUndisplaying(container);
	}
}

const DialogMessageContainer = Container.template($ => ({
	skin: skins.black, Behavior: $.constructor.Behavior,
	contents: [
		Content($, { left: 0, right: 0, top: screen.height /* start hidden */, height: screen.height, skin: backgroundSkin }),
		Content($, { left: PBL_IF_ROUND_ELSE((screen.width - $.iconSkin.width) >> 1, MARGIN), top: screen.height + MARGIN, skin: $.iconSkin }),
		Text($, {
			left: MARGIN, width: screen.width - 2 * MARGIN, top: screen.height + MARGIN + $.iconSkin.height, height: screen.height,
			style: labelStyle, string: DIALOG_MESSAGE_WINDOW_MESSAGE,
		}),
	],
}));

export default class DialogMessageWindow extends View {
	static get Behavior() { return DialogMessageBehavior }
	constructor(data) {
		super(data);
		// Loaded with the window (window_load), freed with it: bitmaps take app heap.
		this.iconSkin = bitmapSkin(RESOURCE_ID.WARNING);
	}
	get Template() { return DialogMessageContainer }
}
