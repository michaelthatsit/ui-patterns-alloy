// The window stack (after the Alloy `words` example's Controller): goTo pushes
// a view with a slide transition, goBack pops. Views are modules; each exports
// a View subclass (piu/View) whose Template is the window's content.
class Controller extends Behavior {
	constructor() {
		super();
		this.going = 0;
		this.history = [];
		this.view = null;
	}
	onCreate(container, $) {
		this.container = container;
		this.model = $;
		watch.addEventListener("minutechange", () => container.distribute("onMinuteChanged"));
	}
	onDisplaying(container) {
		const home = this.model.home;
		this.history = [];
		this.display(container, this.make(home.View, home), false);
	}
	make(id, data) {
		const View = importNow(id).default;
		const view = new View(data);
		view.id = id;
		return view;
	}
	display(container, view, backwards) {
		if (this.view) {
			this.onScreenUndisplaying(container, this.view);
			if (backwards)
				this.view.runTransitionBackwards(view);
			else {
				this.history.push(this.view);
				view.runTransitionForwards(this.view);
			}
		}
		else {
			container.add(new view.Template(view, { left: 0, width: container.width, top: 0, height: container.height }));
			this.going = 0;
			container.defer("onScreenDisplayed");
		}
		this.view = view;
	}
	// window_stack_pop
	goBack(count = 1) {
		if (this.history.length) {
			let view;
			while (count && this.history.length) {
				view = this.history.pop();
				count--;
			}
			this.going = -1;
			this.container.defer("display", view, true);
		}
	}
	// window_stack_push
	goTo(id, data) {
		const view = this.make(id, data);
		this.going = 1;
		this.container.defer("display", view, false);
	}
	onScreenDisplayed(container) {
		container.first.distribute("onDisplayed");
	}
	onScreenUndisplaying(container, view) {
		container.first.distribute("onUndisplaying");
	}
	onTransitionEnded(container) {
		container.purge();
		this.going = 0;
		this.onScreenDisplayed(container);
	}
}

export default Controller;
