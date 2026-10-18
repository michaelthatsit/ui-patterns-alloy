// A PIN entry window: three digits in a SelectionLayer. data: { onComplete(digits) }.
import { GColor, FONT_KEY, textLayerStyle, skins } from "assets";
import { SelectionLayer } from "selection_layer";
import { StatusBar } from "StatusBar";
import View from "piu/View";

export const PIN_WINDOW_NUM_CELLS = 3;
export const PIN_WINDOW_MAX_VALUE = 9;
export const PIN_WINDOW_SIZE = { w: 128, h: 34 };

const textStyle = textLayerStyle(FONT_KEY.GOTHIC_18_BOLD, GColor.Black, "center");

// The selection layer is centred; the texts keep their distances to it from the
// original 168 px screen (cells at 67: title at 30, sub text at 115).
const SELECTION_TOP = (screen.height - PIN_WINDOW_SIZE.h) >> 1;
const MAIN_TEXT_TOP = SELECTION_TOP - 37;
const SUB_TEXT_TOP = SELECTION_TOP + PIN_WINDOW_SIZE.h + 14;

function selectionCallbacks(view) {
	const pin = view.pin;
	return {
		getCellText: (index) => String(pin.digits[index]),
		complete: () => view.data.onComplete(pin.digits),
		increment: (index) => {
			pin.digits[index]++;
			if (pin.digits[index] > PIN_WINDOW_MAX_VALUE)
				pin.digits[index] = 0;
		},
		decrement: (index) => {
			pin.digits[index]--;
			if (pin.digits[index] < 0)
				pin.digits[index] = PIN_WINDOW_MAX_VALUE;
		},
	};
}

class PinWindowBehavior extends View.Behavior {
	// The selection layer takes the buttons.
	onDisplayed(container) {
		container.content(2).focus();
	}
}

const PinWindowContainer = Container.template($ => ({
	skin: skins.white, Behavior: $.constructor.Behavior,
	contents: [
		// Main TextLayer
		Label($, { left: 0, right: 0, top: MAIN_TEXT_TOP, bottom: 0, style: textStyle, string: "PIN Required" }),
		// Sub TextLayer
		Text($, { left: 5, right: 5, top: SUB_TEXT_TOP, bottom: 10, style: textStyle, string: "Enter your PIN to continue" }),
		// Selection layer, centred
		SelectionLayer({
			numCells: PIN_WINDOW_NUM_CELLS,
			cellWidths: [40, 40, 40],
			cellPadding: 4,
			activeBackgroundColor: GColor.Red,
			inactiveBackgroundColor: GColor.DarkGray,
			callbacks: selectionCallbacks($),
		}, {
			left: (screen.width - PIN_WINDOW_SIZE.w) >> 1, top: SELECTION_TOP,
			width: PIN_WINDOW_SIZE.w, height: PIN_WINDOW_SIZE.h,
		}),
		// Status bar: clear background, black text
		StatusBar({ color: GColor.Black }),
	],
}));

export default class PinWindow extends View {
	static get Behavior() { return PinWindowBehavior }
	constructor(data) {
		super(data);
		this.pin = { digits: new Array(PIN_WINDOW_NUM_CELLS).fill(0) };
	}
	get Template() { return PinWindowContainer }
}
