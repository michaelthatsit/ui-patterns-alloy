// Example progress bar implementation: a one pixel line under the status bar.
import { PBL_IF_COLOR_ELSE, STATUS_BAR_LAYER_HEIGHT, GColor, solidSkin } from "pebble-ui/sdk";
import { StatusBar } from "pebble-ui/StatusBar";
import Timer from "timer";
import View from "pebble-ui/View";

const PROGRESS_BAR_WINDOW_SIZE = { w: screen.width, h: 1 }; // System default (144 in the C code: the original screen's width)
const PROGRESS_BAR_WINDOW_DELTA = 33;

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
	skin: solidSkin(PBL_IF_COLOR_ELSE(GColor.DarkCandyAppleRed, GColor.Black)), Behavior: $.constructor.Behavior,
	contents: [
		StatusBar({ color: GColor.White, dotted: true }),
		Content($, { left: 0, top: STATUS_BAR_LAYER_HEIGHT - 2, width: 1, height: PROGRESS_BAR_WINDOW_SIZE.h, skin: solidSkin(GColor.White) }),
	],
}));

export default class ProgressBarWindow extends View {
	static get Behavior() { return ProgressBarBehavior }
	get Template() { return ProgressBarContainer }
}
