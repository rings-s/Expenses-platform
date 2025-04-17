/**
 * Svelte action that triggers a callback when the user clicks outside of an element
 * Usage:
 * <div use:clickOutside={() => isOpen = false}>...</div>
 */
export function clickOutside(node: HTMLElement, callback: () => void) {
	const handleClick = (event: MouseEvent) => {
		// If the clicked element is not the node, trigger the callback
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			callback();
		}
	};

	// Add event listener
	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			// Remove event listener when the component is destroyed
			document.removeEventListener('click', handleClick, true);
		},
		update(newCallback: () => void) {
			callback = newCallback;
		}
	};
}
