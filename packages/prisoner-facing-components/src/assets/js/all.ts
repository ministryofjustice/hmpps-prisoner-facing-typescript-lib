import * as lazyLoad from '../pfs/components/lazy-load/index'
import * as launchpadHeader from '../pfs/components/launchpad-header/index'

export { lazyLoad, launchpadHeader }

export function initAll() {
  lazyLoad.initAll()
  // NOTE: launchpadHeader.initAll() currently omitted on purpose as we aren't using this functionality
}
