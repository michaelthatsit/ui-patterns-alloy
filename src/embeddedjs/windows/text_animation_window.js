// Example text change animation implementation.
import { PBL_IF_COLOR_ELSE, GColor, FONT_KEY, textLayerStyle, solidSkin } from "pebble-ui/sdk";
import Timer from "timer";
import View from "pebble-ui/View";

const TEXT_ANIMATION_WINDOW_DURATION = 40;   // Duration of each half of the animation
const TEXT_ANIMATION_WINDOW_DISTANCE = 5;    // Pixels the animating text move by
const TEXT_ANIMATION_WINDOW_INTERVAL = 1000; // Interval between timers

const DURATION = TEXT_ANIMATION_WINDOW_DURATION;
const DISTANCE = TEXT_ANIMATION_WINDOW_DISTANCE;
const texts = ["Some example text", "Some more example text"];
const textStyle = textLayerStyle(FONT_KEY.GOTHIC_24_BOLD, GColor.White, "center");

// The shake: the text slides left by DISTANCE (out), changes, and slides in
// from DISTANCE right of its place (in); ease in-out, 40 ms each.
class TextBehavior extends Behavior {
	onCreate(label) {
		this.currentText = 0;
		this.phase = 0;
	}
	shake(label) {
		this.phase = 0;
		label.duration = DURATION;
		label.time = 0;
		label.start();
	}
	onTimeChanged(label) {
		const moved = Math.round(DISTANCE * Math.quadEaseInOut(label.fraction));
		label.x = label.container.x + (this.phase === 0 ? -moved : DISTANCE - moved);
	}
	onFinished(label) {
		if (this.phase === 0) {
			this.currentText += (this.currentText === 0) ? 1 : -1;
			label.string = texts[this.currentText];
			label.x = label.container.x + DISTANCE;
			this.phase = 1;
			label.time = 0;
			label.start();
		}
		else
			label.x = label.container.x;
	}
}

class TextAnimationBehavior extends View.Behavior {
	onDisplaying(container) {
		this.animate(container);
		this.timer = Timer.repeat(() => this.animate(container), TEXT_ANIMATION_WINDOW_INTERVAL);
	}
	onUndisplaying(container) {
		Timer.clear(this.timer);
		container.first.stop();
		super.onUndisplaying(container);
	}
	animate(container) {
		container.first.delegate("shake");
	}
}

const TextAnimationContainer = Container.template($ => ({
	skin: solidSkin(PBL_IF_COLOR_ELSE(GColor.BlueMoon, GColor.Black)), Behavior: $.constructor.Behavior,
	contents: [
		Label($, { left: 0, right: 0, top: (screen.height >> 1) - 24, bottom: 0, style: textStyle, string: "Example text.", Behavior: TextBehavior }),
	],
}));

export default class TextAnimationWindow extends View {
	static get Behavior() { return TextAnimationBehavior }
	get Template() { return TextAnimationContainer }
}
