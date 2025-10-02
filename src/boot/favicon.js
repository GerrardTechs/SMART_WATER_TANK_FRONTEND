export default () => {
  const link = document.createElement('link')
  link.rel = 'icon'
  link.href = '/favicon.ico'
  document.head.appendChild(link)
}
