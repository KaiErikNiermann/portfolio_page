const TAG_PATTERN = /\\tag\*?\s*\{/;
const BRACKET_ALIGNED_PATTERN = /\\\[\s*\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}\s*\\\]/g;
const DOLLAR_ALIGNED_PATTERN = /\$\$\s*\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}\s*\$\$/g;
const ALIGN_STAR_PATTERN = /\\begin\{align\*\}([\s\S]*?)\\end\{align\*\}/g;
const ALIGNED_PATTERN = /\\begin\{aligned\}([\s\S]*?)\\end\{aligned\}/g;

function fixEscapedAlignedEndings(value: string): string {
	return value.replace(/(\\+)end\{aligned\}/g, (match, slashes) => {
		if (slashes.length === 2) {
			return `\\end{aligned}`;
		}
		return match;
	});
}

function buildAlignBlock(body: string): string {
	const trimmed = body.trim();
	return trimmed ? `\\begin{align}\n${trimmed}\n\\end{align}` : '\\begin{align}\\end{align}';
}

function transformIfTagged(match: string, body: string, builder: (content: string) => string): string {
	if (!TAG_PATTERN.test(body)) {
		return match;
	}
	return builder(body);
}

export function normalizeAlignEnvironmentTags(input: string): string {
	let output = fixEscapedAlignedEndings(input);

	if (!TAG_PATTERN.test(output)) {
		return output;
	}

	output = output.replace(BRACKET_ALIGNED_PATTERN, (match, body) =>
		transformIfTagged(match, body, (content) => buildAlignBlock(content))
	);

	output = output.replace(DOLLAR_ALIGNED_PATTERN, (match, body) =>
		transformIfTagged(match, body, (content) => buildAlignBlock(content))
	);

	output = output.replace(ALIGN_STAR_PATTERN, (match, body) =>
		transformIfTagged(match, body, (content) => buildAlignBlock(content))
	);

	output = output.replace(ALIGNED_PATTERN, (match, body) =>
		transformIfTagged(match, body, (content) => buildAlignBlock(content))
	);

	return output;
}
