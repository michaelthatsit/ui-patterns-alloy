// A StatusBarLayer: the time in Gothic 18, centred in a 20 px bar; with
// dotted: true, StatusBarLayerSeparatorModeDotted (every other pixel of the
// row above the bar's bottom edge, measured at y 18). The controller sends
// onMinuteChanged every minute.
import { STATUS_BAR_LAYER_HEIGHT as HEIGHT, FONT_KEY, textLayerStyle } from "assets";

const TEXT_TOP = -2; // measured: the digits start at y 5

export function clockString() {
	const date = new Date();
	let hours = date.getHours();
	const minutes = date.getMinutes();
	if (watch.hour12)
		hours = (hours % 12) || 12;
	else if (hours < 10)
		hours = "0" + hours;
	return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
}

class StatusBarBehavior extends Behavior {
	onMinuteChanged(bar) {
		bar.first.string = clockString();
	}
}

class DottedSeparatorBehavior extends Behavior {
	onCreate(port, $) {
		this.color = $.color;
	}
	onDraw(port) {
		for (let i = 0, width = port.width; i < width; i += 2)
			port.fillColor(this.color, i, 0, 1, 1);
	}
}

// $: { color, dotted? }
export const StatusBar = Container.template($ => ({
	left: 0, right: 0, top: 0, height: HEIGHT, Behavior: StatusBarBehavior,
	contents: [
		Label($, {
			left: 0, right: 0, top: TEXT_TOP, height: HEIGHT,
			style: textLayerStyle(FONT_KEY.GOTHIC_18, $.color, "center"),
			string: clockString(),
		}),
		$.dotted ? Port($, { left: 0, right: 0, top: HEIGHT - 2, height: 1, Behavior: DottedSeparatorBehavior }) : null,
	],
}));
