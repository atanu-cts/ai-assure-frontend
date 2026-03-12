/**
 * A GDS styled example home page controller.
 * Provided as an example, remove or modify as required.
 */
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const uploadsDataRaw = readFileSync(`${__dirname}/uploads.json`, 'utf8')
const uploadsData = JSON.parse(uploadsDataRaw)

const totalItems = uploadsData.length
const currentPage = 1
const itemsPerPage = 10
const totalPages = Math.ceil(totalItems / itemsPerPage)

const pagination = {
  summary: {
    startItem: 1,
    endItem: Math.min(itemsPerPage, totalItems),
    totalItems
  },
  items: Array.from({ length: totalPages }, (_, i) => {
    const pageNum = i + 1
    return {
      number: pageNum,
      href: `?page=${pageNum}`,
      current: pageNum === currentPage
    }
  }),
  previous:
    currentPage > 1
      ? {
          href: `?page=${currentPage - 1}`,
          text: 'Previous'
        }
      : null,
  next:
    currentPage < totalPages
      ? {
          href: `?page=${currentPage + 1}`,
          text: 'Next'
        }
      : null
}

export const homeController = {
  handler(_request, h) {
    return h.view('home/index', {
      pageTitle: 'Home',
      heading: 'Home',
      uploads: uploadsData,
      pagination
    })
  }
}
