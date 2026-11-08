function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, (character) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	})[character] ?? character);
}

function renderInline(value: string) {
	const pieces: string[] = [];
	const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
	let lastIndex = 0;

	for (const match of value.matchAll(linkPattern)) {
		const index = match.index ?? 0;
		pieces.push(escapeHtml(value.slice(lastIndex, index)));
		const label = escapeHtml(match[1]);
		const href = escapeHtml(match[2]);
		pieces.push(`<a href="${href}" target="_blank" rel="noreferrer">${label}</a>`);
		lastIndex = index + match[0].length;
	}
	pieces.push(escapeHtml(value.slice(lastIndex)));

	return pieces.join('')
		.replace(/`([^`]+)`/g, '<code>$1</code>')
		.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
		.replace(/__([^_]+)__/g, '<strong>$1</strong>')
		.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
		.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1<em>$2</em>');
}

export function renderTutorialMarkdown(markdown: string) {
	const output: string[] = [];
	let paragraph: string[] = [];
	let list: { type: 'ul' | 'ol'; items: string[] } | null = null;

	const flushParagraph = () => {
		if (!paragraph.length) return;
		output.push(`<p>${paragraph.map(renderInline).join('<br>')}</p>`);
		paragraph = [];
	};
	const flushList = () => {
		if (!list) return;
		output.push(`<${list.type}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${list.type}>`);
		list = null;
	};

	for (const line of markdown.split(/\r?\n/)) {
		const heading = /^(#{1,3})\s+(.+)$/.exec(line);
		const unorderedItem = /^\s*[-*+]\s+(.+)$/.exec(line);
		const orderedItem = /^\s*\d+[.)]\s+(.+)$/.exec(line);

		if (!line.trim()) {
			flushParagraph();
			flushList();
			continue;
		}
		if (heading) {
			flushParagraph();
			flushList();
			const level = heading[1].length + 2;
			output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
			continue;
		}
		if (unorderedItem || orderedItem) {
			flushParagraph();
			const type = unorderedItem ? 'ul' : 'ol';
			if (list?.type !== type) {
				flushList();
				list = { type, items: [] };
			}
			list.items.push((unorderedItem ?? orderedItem)![1]);
			continue;
		}
		flushList();
		paragraph.push(line);
	}

	flushParagraph();
	flushList();
	return output.join('');
}
