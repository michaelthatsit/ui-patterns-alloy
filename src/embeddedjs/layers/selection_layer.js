// Pebble UI component adapted for modular use by Eric Phillips; here a Piu
// Port that draws the cells and runs the same bump and slide animations.
// SelectionLayer($, frame): $ = { numCells, cellWidths, cellPadding?, font?,
// activeBackgroundColor?, inactiveBackgroundColor?, callbacks: { getCellText,
// complete, increment, decrement } }. The C layer does not clip, so the Port
// is MARGIN larger than the frame on every side and draws offset by MARGIN.
import { PBL_IF_COLOR_ELSE, GColor, FONT_KEY, TEXT_TOP_INSET } from "assets";
import Timer from "timer";

export const MAX_SELECTION_LAYER_CELLS = 3;

// Look and feel
const DEFAULT_CELL_PADDING = 10;
const DEFAULT_SELECTED_INDEX = 0;
const DEFAULT_FONT = FONT_KEY.GOTHIC_28_BOLD;
const DEFAULT_ACTIVE_COLOR = GColor.White;
const DEFAULT_INACTIVE_COLOR = PBL_IF_COLOR_ELSE(GColor.DarkGray, GColor.Black);
const TEXT_COLOR = GColor.White; // a GContext's default text colour

const BUTTON_HOLD_REPEAT_MS = 100;
const SETTLE_HEIGHT_DIFF = 6;

// Animation
const BUMP_TEXT_DURATION_MS = 107;
const BUMP_SETTLE_DURATION_MS = 214;
const SLIDE_DURATION_MS = 107;
const SLIDE_SETTLE_DURATION_MS = 179;

const MARGIN = 10;

function pixelsForBumpSettle(animPercentComplete) {
	return animPercentComplete ? SETTLE_HEIGHT_DIFF - Math.floor((SETTLE_HEIGHT_DIFF * animPercentComplete) / 100) : 0;
}

function fontTopPadding(font) {
	return (font === FONT_KEY.GOTHIC_28_BOLD || font === FONT_KEY.GOTHIC_24_BOLD) ? 10 : 0;
}

function yOffsetWhichVerticallyCentersFont(font, height) {
	const fontHeight = font === FONT_KEY.GOTHIC_28_BOLD ? 18 : font === FONT_KEY.GOTHIC_24_BOLD ? 14 : 0;
	return Math.trunc(height / 2) - Math.trunc(fontHeight / 2) - fontTopPadding(font);
}

class SelectionLayerBehavior extends Behavior {
	onCreate(port, $) {
		this.numCells = Math.min($.numCells, MAX_SELECTION_LAYER_CELLS);
		this.cellWidths = $.cellWidths.slice(0, this.numCells);
		this.cellPadding = $.cellPadding ?? DEFAULT_CELL_PADDING;
		this.selectedCellIdx = DEFAULT_SELECTED_INDEX;
		this.isActive = true;
		this.font = $.font ?? DEFAULT_FONT;
		this.activeBackgroundColor = $.activeBackgroundColor ?? DEFAULT_ACTIVE_COLOR;
		this.inactiveBackgroundColor = $.inactiveBackgroundColor ?? DEFAULT_INACTIVE_COLOR;
		this.callbacks = $.callbacks;
		this.style = new Style({ font: this.font });
		this.textTopInset = TEXT_TOP_INSET[this.font] ?? 0;
		// Animation state
		this.phase = null;
		this.bumpIsUpwards = false;
		this.bumpTextAnimProgress = 0;
		this.bumpSettleAnimProgress = 0;
		this.slideIsForward = false;
		this.slideAnimProgress = 0;
		this.slideSettleAnimProgress = 0;
	}
	onDisplayed(port) {
		port.focus();
	}
	onUndisplaying(port) {
		this.clearTimer();
		port.stop();
	}

	// Drawing

	// (x, y, width, height) is the area to redraw; the layer's own size is the port's.
	onDraw(port, x, y, width, height) {
		const h = port.height - 2 * MARGIN;
		this.drawCellBackgrounds(port, h);
		if (this.slideAnimProgress)
			this.drawSliderSlide(port, h);
		if (this.slideSettleAnimProgress)
			this.drawSliderSettle(port, h);
		this.drawText(port, h);
	}
	drawCellBackgrounds(port, h) {
		for (let i = 0, currentXOffset = 0; i < this.numCells; i++) {
			const width = this.cellWidths[i];
			if (!width)
				continue;
			let yOffset = 0;
			if (this.selectedCellIdx === i && this.bumpIsUpwards)
				yOffset = -pixelsForBumpSettle(this.bumpSettleAnimProgress);
			let height = h;
			if (this.selectedCellIdx === i)
				height += pixelsForBumpSettle(this.bumpSettleAnimProgress);
			let color = this.inactiveBackgroundColor;
			if (this.selectedCellIdx === i && !this.slideAnimProgress)
				color = this.activeBackgroundColor;
			port.fillColor(color, MARGIN + currentXOffset, MARGIN + yOffset, width, height);
			currentXOffset += width + this.cellPadding;
		}
	}
	startingXOffset() {
		let x = 0;
		for (let i = 0; i < this.numCells; i++) {
			if (this.selectedCellIdx === i)
				break;
			x += this.cellWidths[i] + this.cellPadding;
		}
		return x;
	}
	drawSliderSlide(port, h) {
		const nextCellWidth = this.cellWidths[this.selectedCellIdx + (this.slideIsForward ? 1 : -1)];
		const slideDistance = nextCellWidth + this.cellPadding;
		let currentSlideDistance = Math.trunc((slideDistance * this.slideAnimProgress) / 100);
		if (!this.slideIsForward)
			currentSlideDistance = -currentSlideDistance;
		let currentXOffset = this.startingXOffset() + currentSlideDistance;
		const curCellWidth = this.cellWidths[this.selectedCellIdx];
		const totalCellWidthChange = nextCellWidth - curCellWidth + this.cellPadding;
		const currentCellWidthChange = Math.trunc((totalCellWidthChange * this.slideAnimProgress) / 100);
		const currentCellWidth = curCellWidth + currentCellWidthChange;
		if (!this.slideIsForward)
			currentXOffset -= currentCellWidthChange;
		port.fillColor(this.activeBackgroundColor, MARGIN + currentXOffset, MARGIN, currentCellWidth, h);
	}
	drawSliderSettle(port, h) {
		let xOffset = this.startingXOffset();
		if (this.slideIsForward)
			xOffset += this.cellWidths[this.selectedCellIdx];
		const currentWidth = Math.trunc((this.cellPadding * this.slideSettleAnimProgress) / 100);
		if (!this.slideIsForward)
			xOffset -= currentWidth;
		port.fillColor(this.activeBackgroundColor, MARGIN + xOffset, MARGIN, currentWidth, h);
	}
	drawText(port, h) {
		for (let i = 0, currentXOffset = 0; i < this.numCells; i++) {
			const text = this.callbacks.getCellText(i);
			if (text != null) {
				let height = h;
				if (this.selectedCellIdx === i)
					height += pixelsForBumpSettle(this.bumpSettleAnimProgress);
				let yOffset = yOffsetWhichVerticallyCentersFont(this.font, height);
				if (this.selectedCellIdx === i && this.bumpIsUpwards)
					yOffset -= pixelsForBumpSettle(this.bumpSettleAnimProgress);
				if (this.selectedCellIdx === i) {
					let delta = Math.trunc((this.bumpTextAnimProgress * fontTopPadding(this.font)) / 100);
					if (this.bumpIsUpwards)
						delta = -delta;
					yOffset += delta;
				}
				// Port.drawString draws from (x, y) whatever the style's alignment and margins:
				// GTextAlignmentCenter and the TextLayer inset by hand.
				const textX = currentXOffset + Math.trunc((this.cellWidths[i] - this.style.measure(text).width) / 2);
				port.drawString(text, this.style, TEXT_COLOR, MARGIN + textX, MARGIN + yOffset + this.textTopInset, this.cellWidths[i], height);
			}
			currentXOffset += this.cellWidths[i] + this.cellPadding;
		}
	}

	// Animations: the bump (text to the cell's edge, then the cell settles) on
	// Up/Down, and the slide (the selection moves and overshoots, then settles)
	// on Select/Back. One phase runs at a time, on the Port's clock.

	run(port, phase, duration) {
		this.phase = phase;
		port.duration = duration;
		port.time = 0;
		port.start();
	}
	onTimeChanged(port) {
		const fraction = port.fraction;
		switch (this.phase) {
		case "bumpText": this.bumpTextAnimProgress = Math.round(100 * Math.quadEaseIn(fraction)); break;
		case "bumpSettle": this.bumpSettleAnimProgress = Math.round(100 * Math.quadEaseOut(fraction)); break;
		case "slide": this.slideAnimProgress = Math.round(100 * Math.quadEaseIn(fraction)); break;
		case "slideSettle": this.slideSettleAnimProgress = 100 - Math.round(100 * Math.quadEaseOut(fraction)); break;
		}
		port.invalidate();
	}
	onFinished(port) {
		switch (this.phase) {
		case "bumpText":
			this.bumpTextAnimProgress = 0;
			this.change(this.bumpIsUpwards);
			this.run(port, "bumpSettle", BUMP_SETTLE_DURATION_MS);
			break;
		case "bumpSettle":
			this.bumpSettleAnimProgress = 0;
			this.phase = null;
			break;
		case "slide":
			this.slideAnimProgress = 0;
			this.selectedCellIdx += this.slideIsForward ? 1 : -1;
			this.run(port, "slideSettle", SLIDE_SETTLE_DURATION_MS);
			break;
		case "slideSettle":
			this.slideSettleAnimProgress = 0;
			this.phase = null;
			break;
		}
		port.invalidate();
	}
	// animation_unschedule(next_cell_animation): a slide in progress lands on its cell at once.
	cancelSlide(port) {
		if (this.phase === "slide")
			this.selectedCellIdx += this.slideIsForward ? 1 : -1;
		if (this.phase === "slide" || this.phase === "slideSettle") {
			port.stop();
			this.slideAnimProgress = this.slideSettleAnimProgress = 0;
			this.phase = null;
		}
	}
	change(upwards) {
		if (upwards)
			this.callbacks.increment(this.selectedCellIdx, 1);
		else
			this.callbacks.decrement(this.selectedCellIdx, 1);
	}

	// Click handlers

	pressUpDown(port, upwards) {
		if (!this.isActive)
			return true;
		if (this.phase) {
			// Already animating: just update the text
			this.change(upwards);
			port.invalidate();
		}
		else {
			this.bumpIsUpwards = upwards;
			this.run(port, "bumpText", BUMP_TEXT_DURATION_MS);
		}
		// While held: don't animate, just update the text
		this.clearTimer();
		this.timer = Timer.set(() => {
			this.change(upwards);
			port.invalidate();
		}, BUTTON_HOLD_REPEAT_MS, BUTTON_HOLD_REPEAT_MS);
		return true;
	}
	clearTimer() {
		if (this.timer !== undefined) {
			Timer.clear(this.timer);
			this.timer = undefined;
		}
	}
	onPressUp(port) {
		return this.pressUpDown(port, true);
	}
	onPressDown(port) {
		return this.pressUpDown(port, false);
	}
	onReleaseUp(port) {
		this.clearTimer();
		return true;
	}
	onReleaseDown(port) {
		this.clearTimer();
		return true;
	}
	onPressSelect(port) {
		if (!this.isActive)
			return true;
		this.cancelSlide(port);
		if (this.selectedCellIdx >= this.numCells - 1) {
			this.selectedCellIdx = 0;
			this.callbacks.complete();
		}
		else {
			this.slideIsForward = true;
			this.run(port, "slide", SLIDE_DURATION_MS);
		}
		return true;
	}
	onPressBack(port) {
		if (!this.isActive)
			return true;
		this.cancelSlide(port);
		if (this.selectedCellIdx === 0)
			return false; // window_stack_pop: the view handles it
		this.slideIsForward = false;
		this.run(port, "slide", SLIDE_DURATION_MS);
		return true;
	}
}

export function SelectionLayer($, frame) {
	return new Port($, {
		left: frame.left - MARGIN, top: frame.top - MARGIN,
		width: frame.width + 2 * MARGIN, height: frame.height + 2 * MARGIN,
		Behavior: SelectionLayerBehavior,
	});
}
