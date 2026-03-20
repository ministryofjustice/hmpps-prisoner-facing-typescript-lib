import * as lazyLoadModule from '../pfs/components/lazy-load/index'
export const lazyLoad = lazyLoadModule

import * as launchpadHeaderModule from '../pfs/components/launchpad-header/index'
export const launchpadHeader = launchpadHeaderModule

export function initAll() {
  lazyLoadModule.initAll()
  // NOTE: launchpadHeader.initAll() currently omitted on purpose as we aren't using this functionality
}
