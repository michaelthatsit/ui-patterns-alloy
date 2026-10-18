// A view is a window: its Template builds the screen, its Behavior is the
// screen's behavior. Back pops the view when there is history; on the home
// view Back is left unhandled, so the firmware closes the app (as with the C
// SDK's default click handling). Transitions slide, like window_stack_push.
import Timeline from "piu/Timeline";

class ViewBehavior extends Behavior {
	onCreate(container, view) {
		this.view = view;
	}
	onDisplayed(container) {
		container.focus();
	}
	onPressBack(container) {
		if (controller.history.length) {
			controller.goBack();
			return true;
		}
	}
	onUndisplaying(container) {
		controller.container.focus();
	}
}

class ViewTimeline extends Timeline {
	constructor(screen, view, other, direction) {
		super();
		if (controller.going != direction)
			this.from(screen, { x: screen.x - screen.width }, 250, Math.quadEaseOut, 0);
		else
			this.from(screen, { x: screen.x + screen.width }, 250, Math.quadEaseIn, 0);
		this.simultaneous = true;
	}
}

class View {
	static get Behavior() { return ViewBehavior }
	constructor(data) {
		this.data = data;
	}
	get Timeline() {
		return ViewTimeline;
	}
	// Drops the view's references to Piu contents, so a view in history holds no screen.
	purge() {
		for (const key in this)
			if (this[key] instanceof Content) delete this[key];
	}
	runTransitionBackwards(toView) {
		const container = controller.container;
		container.run(null);
		container.run(new TimelineTransition(this.Timeline, toView.Timeline), container.first, toView.Template, this, toView);
	}
	runTransitionForwards(fromView) {
		const container = controller.container;
		container.run(null);
		container.run(new TimelineTransition(fromView.Timeline, this.Timeline), container.first, this.Template, fromView, this);
	}
}

Object.freeze(View);

export default View;

class TimelineTransition extends Transition {
	constructor(FromTimeline, ToTimeline) {
		super(0);
		this.FromTimeline = FromTimeline;
		this.ToTimeline = ToTimeline;
	}
	onBegin(container, fromScreen, Template, fromView, toView) {
		this.fromScreen = fromScreen;
		const toScreen = this.toScreen = new Template(toView, { left: 0, width: screen.width, top: 0, height: screen.height });
		if (controller.going < 0)
			container.insert(toScreen, fromScreen);
		else
			container.add(toScreen);
		this.fromTimeline = new this.FromTimeline(fromScreen, fromView, toView, -1);
		this.toTimeline = new this.ToTimeline(toScreen, toView, fromView, 1);
		const fromDuration = this.fromTimeline.duration;
		const toDuration = this.toTimeline.duration;
		const duration = Math.max(fromDuration, toDuration);
		this.fromFraction = fromDuration / duration;
		this.toFraction = (duration - toDuration) / duration;
		this.duration = duration;
	}
	onEnd(container, fromScreen, Template, fromView, toView) {
		this.toTimeline = null;
		this.fromTimeline = null;
		container.remove(fromScreen);
		fromView.purge();
	}
	onStep(fraction) {
		this.fromTimeline.fraction = (fraction < this.fromFraction) ? (this.fromFraction - fraction) / this.fromFraction : 0;
		this.toTimeline.fraction = (fraction > this.toFraction) ? (fraction - this.toFraction) / (1 - this.toFraction) : 0;
	}
}
