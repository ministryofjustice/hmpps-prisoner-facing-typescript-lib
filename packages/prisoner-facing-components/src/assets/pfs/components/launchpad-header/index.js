export function initAll() {
  initHeader()
}

function initHeader() {
  const userToggle = document.querySelector('.launchpad-home-header__user-menu-toggle')
  const userMenu = document.getElementById('launchpad-home-header-user-menu')

  if (userToggle && userMenu) {
    userToggle.removeAttribute('hidden')

    initCloseTabs([[userToggle, userMenu]])

    userToggle.addEventListener('click', () => toggleMenu(userToggle, userMenu))
  }
}

function initCloseTabs(tabTuples) {
  tabTuples.forEach(([toggle, menu]) => {
    if (menu) {
      menu.setAttribute('hidden', 'hidden')
      if (toggle) {
        toggle.classList.remove(tabOpenClass)
        toggle.parentElement.classList.remove('item-open')
        toggle.setAttribute('aria-expanded', 'false')
      }
    }
  })
}

function toggleMenu(toggle, menu) {
  if (menu) {
    const isOpen = !menu.hasAttribute('hidden')

    if (isOpen) {
      initCloseTabs([[toggle, menu]])
    } else {
      menu.removeAttribute('hidden')
      toggle.classList.add(tabOpenClass)
      toggle.parentElement.classList.add('item-open')
      toggle.setAttribute('aria-expanded', 'true')
    }
  }
}

const tabOpenClass = 'launchpad-home-header__toggle-open'
