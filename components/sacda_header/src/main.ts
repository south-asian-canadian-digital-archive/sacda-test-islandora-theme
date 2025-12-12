import { mount } from 'svelte'
import './app.css'
import Header from './Header.svelte'

const target = document.querySelector('.svelte-component-root[data-component="sacda_header"]');

if (target) {
	const propsStr = target.getAttribute('data-props');
	const props = propsStr ? JSON.parse(propsStr) : {};

	mount(Header, {
		target: target,
		props: props
	})
}
