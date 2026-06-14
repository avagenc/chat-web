/* Svelte action: teleport a node to <body> so fixed-position floats and
   modals escape any overflow:hidden / stacking-context ancestors.
   Replaces ReactDOM.createPortal(node, document.body). */
/** @param {HTMLElement} node */
export function portal(node) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
}
