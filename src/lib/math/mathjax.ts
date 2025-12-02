import { mathjaxMacros } from './macros';

const MATHJAX_SRC = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';

declare global {
	interface Window {
		MathJax?: {
			startup?: {
				promise?: Promise<void>;
				document?: {
					math?: MathJaxMathItem[];
					getMathItemsWithin?: (node: HTMLElement) => MathJaxMathItem[];
				};
			};
			typesetPromise?: (elements?: Element[] | undefined) => Promise<void>;
			tex?: Record<string, unknown>;
			options?: Record<string, unknown>;
		} & Record<string, unknown>;
	}
}

let scriptPromise: Promise<void> | null = null;

type MathJaxMathItem = {
	display?: boolean;
	math?: string;
	typesetRoot?: Element;
};

function configureMathJax() {
	if (typeof window === 'undefined') return;
	const existing = window.MathJax ?? {};
	window.MathJax = {
		...existing,
		tex: {
			inlineMath: [
				['$', '$'],
				['\\(', '\\)']
			],
			displayMath: [
				['$$', '$$'],
				['\\[', '\\]']
			],
			macros: {
				// Spread existing macros first so local overrides win.
				...(existing.tex as { macros?: Record<string, unknown> })?.macros,
				...mathjaxMacros
			}
		},
		options: {
			...(existing.options ?? {}),
			skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
		}
	};
}

function loadMathJaxScript(): Promise<void> {
	if (scriptPromise) return scriptPromise;
	if (typeof window === 'undefined' || document.getElementById('mathjax-script')) {
		return (scriptPromise = Promise.resolve());
	}

	scriptPromise = new Promise((resolve, reject) => {
		configureMathJax();
		const script = document.createElement('script');
		script.id = 'mathjax-script';
		script.src = MATHJAX_SRC;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = (event) => reject(event);
		document.head.appendChild(script);
	});

	return scriptPromise;
}

function wrapDisplayMath(target: HTMLElement) {
	if (typeof window === 'undefined') return;
	const mathDocument = window.MathJax?.startup?.document;
	const mathItems = mathDocument?.getMathItemsWithin
		? mathDocument.getMathItemsWithin(target)
		: mathDocument?.math ?? [];
	const handled = new Set<Element>();
	(mathItems ?? []).forEach((item) => {
		if (!item.display) return;
		const root = item.typesetRoot as HTMLElement | undefined;
		if (!root) return;
		handled.add(root);
		wrapContainer(root, item.math);
	});
	const containers = target.querySelectorAll<HTMLElement>('mjx-container[display="true"]');
	containers.forEach((root) => {
		if (handled.has(root)) return;
		wrapContainer(root, undefined);
	});
}

function wrapContainer(root: HTMLElement, texSource?: string) {
	if (root.parentElement?.classList.contains('math-block')) return;
	const block = document.createElement('div');
	block.className = 'math-block';
	if (texSource) {
		block.dataset.texSource = texSource.trim();
	}
	const scroller = document.createElement('div');
	scroller.className = 'math-block-content';
	root.parentNode?.insertBefore(block, root);
	block.appendChild(scroller);
	scroller.appendChild(root);
}

export async function typesetMath(container?: HTMLElement | null) {
	if (typeof window === 'undefined') return;
	configureMathJax();
	await loadMathJaxScript();
	await window.MathJax?.startup?.promise;

	if (window.MathJax?.typesetPromise) {
		await window.MathJax.typesetPromise(container ? [container] : undefined);
	}

	const target = container ?? document.body;
	if (target) {
		wrapDisplayMath(target);
	}
}
