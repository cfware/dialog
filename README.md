# @cfware/dialog [![NPM Version][npm-image]][npm-url]

Dialog overlays

## Usage

```js
import {html} from '@cfware/shadow-element';
import {dialogAlert, dialogConfirm} '@cfware/dialog';

async function showAlert() {
	await dialogAlert('Title', html`<div>html tagged template</div>`);
	console.log('dialog closed');
}

async function showConfirm() {
	const result = await dialogConfirm('Continue', html`<div>Decide</div>`);
	console.log(result ? 'confirmed' : 'canceled');
}

```

[npm-image]: https://img.shields.io/npm/v/@cfware/dialog.svg
[npm-url]: https://npmjs.org/package/@cfware/dialog
