import PDFDocument from 'pdfkit'

function decodeBasicHtmlEntities(input) {
	if (!input) return ''
	return input
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
}

function htmlToPlainText(html) {
	if (!html) return ''

	let text = String(html)

	text = text
		.replace(/<\s*br\s*\/?>/gi, '\n')
		.replace(/<\/\s*p\s*>/gi, '\n\n')
		.replace(/<\/\s*div\s*>/gi, '\n')
		.replace(/<\/\s*li\s*>/gi, '\n')
		.replace(/<\s*li[^>]*>/gi, '• ')
	text = text.replace(/<[^>]+>/g, '')
	text = decodeBasicHtmlEntities(text)
	text = text.replace(/\r\n/g, '\n')
	text = text.replace(/\n{3,}/g, '\n\n')
	return text.trim()
}

function safeFilename(input, fallback = 'article') {
	const base = (input || fallback).toString().trim()
	const cleaned = base
		.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
		.replace(/\s+/g, ' ')
		.trim()
	return (cleaned || fallback).slice(0, 80)
}

function formatDate(dateLike) {
	if (!dateLike) return ''
	const d = new Date(dateLike)
	if (Number.isNaN(d.getTime())) return ''
	return d.toLocaleString('en-US', {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	})
}

function ensureSpace(doc, requiredHeight, marginBottom = 72) {
	const bottomY = doc.page.height - marginBottom
	if (doc.y + requiredHeight > bottomY) {
		doc.addPage()
	}
}

function writeParagraphWithPagination(doc, paragraph, options) {
	const text = (paragraph || '').trimEnd()
	if (!text) {
		doc.moveDown(0.5)
		return
	}

	const estimate = doc.heightOfString(text, options)
	ensureSpace(doc, estimate)

	const availableHeight = () =>
		doc.page.height - (options.marginBottom ?? 72) - doc.y
	const fitsNow = () => doc.heightOfString(text, options) <= availableHeight()

	if (fitsNow()) {
		doc.text(text, options)
		doc.moveDown(0.5)
		return
	}

	const words = text.split(/\s+/)
	let chunk = ''
	for (const word of words) {
		const candidate = chunk ? `${chunk} ${word}` : word
		const h = doc.heightOfString(candidate, options)
		if (h <= availableHeight()) {
			chunk = candidate
			continue
		}

		if (chunk) {
			doc.text(chunk, options)
			doc.moveDown(0.5)
			doc.addPage()
			chunk = word
			continue
		}

		doc.text(word, options)
		doc.moveDown(0.5)
		doc.addPage()
		chunk = ''
	}

	if (chunk) {
		doc.text(chunk, options)
		doc.moveDown(0.5)
	}
}

function writeSectionTitle(doc, title) {
	doc.moveDown(0.25)
	doc.font('Helvetica-Bold').fontSize(13).fillColor('#111').text(title)
	doc.moveDown(0.25)
	doc
		.moveTo(doc.page.margins.left, doc.y)
		.lineTo(doc.page.width - doc.page.margins.right, doc.y)
		.strokeColor('#dddddd')
		.stroke()
	doc.moveDown(0.75)
}

export function streamArticleAsPdf(res, article) {
	const doc = new PDFDocument({
		size: 'A4',
		margins: { top: 72, left: 72, right: 72, bottom: 72 },
		info: {
			Title: article?.title || 'Article',
			Author: article?.author?.email || undefined,
		},
	})

	const filename = `${safeFilename(article?.title, 'article')}.pdf`
	res.setHeader('Content-Type', 'application/pdf')
	res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

	doc.pipe(res)

	doc
		.font('Helvetica-Bold')
		.fontSize(22)
		.fillColor('#111')
		.text(article?.title || 'Untitled')
	doc.moveDown(0.5)

	const metaLines = []
	if (article?.author?.email) metaLines.push(`Author: ${article.author.email}`)
	if (article?.workspace) metaLines.push(`Workspace: ${article.workspace}`)
	if (article?.version != null) metaLines.push(`Version: ${article.version}`)
	if (article?.createdAt)
		metaLines.push(`Created: ${formatDate(article.createdAt)}`)
	if (article?.updatedAt)
		metaLines.push(`Updated: ${formatDate(article.updatedAt)}`)

	if (metaLines.length) {
		doc
			.font('Helvetica')
			.fontSize(10)
			.fillColor('#555')
			.text(metaLines.join('  •  '), {
				width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
			})
	}

	doc.moveDown(1)
	doc
		.moveTo(doc.page.margins.left, doc.y)
		.lineTo(doc.page.width - doc.page.margins.right, doc.y)
		.strokeColor('#cccccc')
		.stroke()
	doc.moveDown(1)

	writeSectionTitle(doc, 'Content')

	const plainText = htmlToPlainText(article?.content || '')
	const options = {
		width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
		align: 'left',
		lineGap: 4,
		marginBottom: doc.page.margins.bottom,
	}

	doc.font('Helvetica').fontSize(11).fillColor('#111')

	const paragraphs = plainText.split(/\n{2,}/)
	for (const paragraph of paragraphs) {
		writeParagraphWithPagination(doc, paragraph, options)
	}
	
	const range = doc.bufferedPageRange()
	for (let i = range.start; i < range.start + range.count; i++) {
		doc.switchToPage(i)
		const pageNum = i + 1
		doc.font('Helvetica').fontSize(9).fillColor('#888')
		doc.text(
			`Page ${pageNum} of ${range.count}`,
			doc.page.margins.left,
			doc.page.height - 48,
			{
				align: 'right',
				width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
			},
		)
	}

	doc.end()
}
