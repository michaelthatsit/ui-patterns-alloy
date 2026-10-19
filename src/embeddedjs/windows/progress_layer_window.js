import { PBL_IF_COLOR_ELSE, GColor, solidSkin } from "pebble-ui/sdk";
import { ProgressLayer } from "pebble-ui/ProgressLayer";
import Timer from "timer";
import View from "pebble-ui/View";

const PROGRESS_LAYER_WINDOW_DELTA = 33;
const PROGRESS_LAYER_WINDOW_WIDTH = 80;

class ProgressLayerWindowBehavior extends View.Behavior {
	// window_appear
	onDisplaying(container) {
		this.progress = 0;
		this.timer = Timer.repeat(() => {
			this.progress += (this.progress < 100) ? 1 : -100;
			container.first.delegate("setProgress", this.progress);
		}, PROGRESS_LAYER_WINDOW_DELTA);
	}
	// window_disappear
	onUndisplaying(container) {
		Timer.clear(this.timer);
		super.onUndisplaying(container);
	}
}

const ProgressLayerContainer = Container.template($ => ({
	skin: solidSkin(PBL_IF_COLOR_ELSE(GColor.LightGray, GColor.White)), Behavior: $.constructor.Behavior,
	contents: [
		ProgressLayer({
			width: PROGRESS_LAYER_WINDOW_WIDTH, progress: 0, cornerRadius: 2,
			foregroundColor: GColor.White, backgroundColor: GColor.Black,
		}, {
			// 4 px above the middle, as the C code's 80 is on the 168 px screen.
			left: (screen.width - PROGRESS_LAYER_WINDOW_WIDTH) >> 1, top: (screen.height >> 1) - 4, width: PROGRESS_LAYER_WINDOW_WIDTH, height: 6,
		}),
	],
}));

export default class ProgressLayerWindow extends View {
	static get Behavior() { return ProgressLayerWindowBehavior }
	get Template() { return ProgressLayerContainer }
}
