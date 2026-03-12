export function buildNavigation(request) {
  return [
    {
      text: 'Home',
      href: '/',
      current: request?.path === '/'
    },
    {
      text: 'Result',
      href: '/result',
      current: request?.path === '/result'
    }
  ]
}
