// ProgressLayer: a rounded track with a rounded fill progress_percent wide.
// $: { width, progress?, cornerRadius?, foregroundColor?, backgroundColor? }
import { GColor } from "assets";

class ProgressLayerBehavior extends Behavior {
	onCreate(layer, $) {
		this.width = $.width;
		this.progress = $.progress ?? 0;
	}
	onDisplaying(layer) {
		this.setProgress(layer, this.progress);
	}
	setProgress(layer, progress) {
		this.progress = Math.min(100, progress);
		const width = Math.floor((this.progress * this.width) / 100);
		layer.last.coordinates = { left: 0, top: 0, bottom: 0, width };
		layer.last.visible = width > 0;
	}
	incrementProgress(layer, progress) {
		this.setProgress(layer, this.progress + progress);
	}
}

export const ProgressLayer = Container.template($ => ({
	Behavior: ProgressLayerBehavior,
	contents: [
		RoundRect($, { left: 0, right: 0, top: 0, bottom: 0, radius: $.cornerRadius ?? 1, skin: new Skin({ fill: $.backgroundColor ?? GColor.White }) }),
		RoundRect($, { left: 0, top: 0, bottom: 0, width: 0, radius: $.cornerRadius ?? 1, skin: new Skin({ fill: $.foregroundColor ?? GColor.Black }) }),
	],
}));
