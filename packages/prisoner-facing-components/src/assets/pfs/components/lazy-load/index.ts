import DOMPurify from 'dompurify'

// eslint-disable-next-line import/prefer-default-export
export const initAll = () => {
  const interactionObserver = new IntersectionObserver(interactionCallback)

  document.querySelectorAll('[data-lazy-load]').forEach(element => {
    interactionObserver.observe(element)
  })
}

// Performed when the observed elements appear in viewport
const interactionCallback: IntersectionObserverCallback = (entries, observer) => {
  const visibleElements = entries.filter(e => e.isIntersecting)

  visibleElements.forEach(({ target }) => {
    lazyLoad(target as HTMLElement)

    // lazyload this element only once
    observer.unobserve(target)
  })
}

// Replace the contents of the lazy load placeholder with content from the server
const lazyLoad = (element: HTMLElement) => {
  const contentUrl = element.dataset.lazyLoad

  // Don't allow external requests
  if (contentUrl === undefined || !contentUrl.startsWith('/')) return

  fetch(contentUrl)
    .then(response => response.text())
    .then(response => {
      // eslint-disable-next-line no-param-reassign
      element.innerHTML = DOMPurify.sanitize(response, { USE_PROFILES: { html: true } })
    })
}
