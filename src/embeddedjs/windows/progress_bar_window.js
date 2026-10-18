// Example progress bar implementation.
import { PBL_IF_COLOR_ELSE, STATUS_BAR_LAYER_HEIGHT, GColor, skins } from "assets";
import { StatusBar } from "StatusBar";
import Timer from "timer";
import View from "piu/View";

export const PROGRESS_BAR_WINDOW_SIZE = { w: screen.width, h: 1 }; // System default (144 in the C code: the original screen's width)
export const PROGRESS_BAR_WINDOW_DELTA = 33;

class ProgressBarBehavior extends View.Behavior {
	// window_appear
	onDisplaying(container) {
		this.progress = 0; // 0 - 100
		this.draw(container);
		this.timer = Timer.repeat(() => {
			this.progress += (this.progress < 100) ? 1 : -100;
			this.draw(container);
		}, PROGRESS_BAR_WINDOW_DELTA);
	}
	// window_disappear
	onUndisplaying(container) {
		Timer.clear(this.timer);
		super.onUndisplaying(container);
	}
	// graphics_draw_line from (0, 0) to (width, 0): width + 1 pixels
	draw(container) {
		const width = Math.trunc((this.progress / 100) * PROGRESS_BAR_WINDOW_SIZE.w);
		container.last.coordinates = { left: 0, top: STATUS_BAR_LAYER_HEIGHT - 2, width: width + 1, height: PROGRESS_BAR_WINDOW_SIZE.h };
	}
}

const ProgressBarContainer = Container.template($ => ({
	skin: new Skin({ fill: PBL_IF_COLOR_ELSE(GColor.DarkCandyAppleRed, GColor.Black) }), Behavior: $.constructor.Behavior,
	contents: [
		StatusBar({ color: GColor.White, dotted: true }),
		Content($, { left: 0, top: STATUS_BAR_LAYER_HEIGHT - 2, width: 1, height: PROGRESS_BAR_WINDOW_SIZE.h, skin: skins.white }),
	],
}));

export default class ProgressBarWindow extends View {
	static get Behavior() { return ProgressBarBehavior }
	get Template() { return ProgressBarContainer }
}
