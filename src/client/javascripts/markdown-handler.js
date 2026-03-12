import { marked } from 'marked'

document.addEventListener('DOMContentLoaded', function () {
  const source = document.getElementById('markdownSource')
  const container = document.getElementById('markdownRenderer')

  if (!source || !container) return

  const markdownContent = source.textContent
  if (!markdownContent) return

  try {
    const html = marked.parse(markdownContent)
    container.innerHTML = html

    container.querySelectorAll('table').forEach((table) => {
      table.classList.add('govuk-table')
      table.querySelectorAll('thead').forEach((thead) => {
        thead.classList.add('govuk-table__head')
      })
      table.querySelectorAll('tbody').forEach((tbody) => {
        tbody.classList.add('govuk-table__body')
      })
      table.querySelectorAll('th').forEach((th) => {
        th.classList.add('govuk-table__header')
      })
      table.querySelectorAll('td').forEach((td) => {
        td.classList.add('govuk-table__cell')
      })
    })
  } catch (error) {
    console.error('Error processing markdown:', error)
  }
})
