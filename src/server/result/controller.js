/**
 * A GDS styled example result page controller.
 * Provided as an example, remove or modify as required.
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const resultsDataRaw = readFileSync(`${__dirname}/result.json`, 'utf8')
const resultsData = JSON.parse(resultsDataRaw)

export const resultController = {
  handler(_request, h) {
    let markdownContent = ''

    try {
      markdownContent = resultsData?.content?.[0]?.text || ''
    } catch (err) {
      console.error('Error reading JSON:', err)
      markdownContent = 'Error loading JSON content.'
    }

    return h.view('result/index', {
      pageTitle: 'Result',
      heading: 'Result',
      markdownContent
      // breadcrumbs: [
      //   { text: 'Home', href: '/' },
      //   { text: 'Result' }
      // ]
    })
  }
}
