// Delete me when I know CI runs these tests from the parent npm command

import dummyModule from '.'

describe('dummyModule', () => {
  it('returns 2', () => {
    expect(dummyModule()).toEqual(2)
  })
})
