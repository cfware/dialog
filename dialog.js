import ShadowElement, {template, html, htmlNode, define} from '@cfware/shadow-element';

class CFWareDialog extends ShadowElement {
	get [template]() {
		return html`
			<style>
				:host {
					position: absolute;
					top: 0;
					bottom: 0;
					left: 0;
					right: 0;
					background: #8888;
					display: grid;
					grid: 1fr auto auto 1fr/1fr;
				}

				[m] {
					max-width: 50%;
					margin: auto;
					background: #ddd;
					border: 1px solid #999;
					border-radius: .5rem;
					display: grid;
				}

				[t] {
					font-size: 1.6rem;
					font-weight: 700;
					padding: .5rem;
					padding-right: 4rem;
				}

				[c] {
					padding: 1rem;
					background: #fff;
				}

				[b] {
					display: grid;
					grid-template-columns: 1fr auto;
					padding: .5rem;
				}
			</style>
			<div />
			<div m>
				<div t><slot name=t /></div>
				<div c><slot name=c /></div>
				<div b>
					<div></div>
					<div><slot name=b /></div>
				</div>
			</div>
		`;
	}
}

CFWareDialog[define]('c-d');

const createDialogNode = (title, body, buttons) => htmlNode`
	<c-d>
		<div slot=t>${title}</div>
		<div slot=c>${body}</div>
		<div slot=b>${buttons}</div>
	</c-d>
`;

function findActiveElement() {
	let {activeElement} = document;
	while (activeElement?.shadowRoot?.activeElement) {
		activeElement = activeElement.shadowRoot.activeElement;
	}

	return activeElement;
}

const eventKeys = {
	Enter: true,
	Escape: false
};

export const escapeEnterHandler = event => eventKeys[event.key];

let abortSignalers = [];

export function abortDialogs() {
	for (const signaler of abortSignalers) {
		signaler();
	}
}

export function runDialog(title, body, buttons, onkeyup = escapeEnterHandler) {
	const activeElement = findActiveElement();

	return new Promise(resolve => {
		const node = createDialogNode(title, body, buttons);
		const elements = [...document.body.children];
		const cleanup = result => {
			abortSignalers = abortSignalers.filter(fn => fn !== cleanup);
			for (const element of elements) {
				element.removeAttribute('tabindex');
			}

			window.removeEventListener('keydown', keydownHandler);
			window.removeEventListener('keyup', keyupHandler);
			node.remove();
			setTimeout(() => activeElement?.focus());
			resolve(result);
		};

		abortSignalers.push(cleanup);
		for (const element of elements) {
			element.tabIndex = -1;
		}

		let keydown;
		const keydownHandler = event => {
			keydown = event.key;
		};

		const keyupHandler = event => {
			if (!event.isClick && keydown !== event.key) {
				return;
			}

			keydown = null;
			const result = onkeyup(event);
			if (result !== undefined) {
				cleanup(result);
			}
		};

		document.body.append(node);
		for (const button of node.querySelectorAll('button')) {
			button.addEventListener('click', () => keyupHandler({
				key: button.getAttribute('key'),
				isClick: true
			}));
		}

		setTimeout(() => {
			const autofocus = node.querySelector('[autofocus]') ?? node.querySelector('[name]');
			autofocus?.focus();
			window.addEventListener('keydown', keydownHandler);
			window.addEventListener('keyup', keyupHandler);
		});
	});
}

export function dialogAlert(title, body) {
	return runDialog(
		title,
		body,
		html`<button autofocus key=Enter>OK</button>`
	);
}

export function dialogConfirm(title, body, yesLabel = 'OK', noLabel = 'Cancel') {
	return runDialog(
		title,
		body,
		html`
			<button key=Enter>${yesLabel}</button>
			<button autofocus key=Escape>${noLabel}</button>
		`
	);
}
