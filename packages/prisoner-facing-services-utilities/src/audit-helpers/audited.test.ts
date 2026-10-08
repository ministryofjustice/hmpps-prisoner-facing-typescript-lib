import { auditLogged, auditEventLoggers, AuditLoggingCallback } from './audited'

describe('auditEventLoggers', () => {
  it('returns a audit event logger that will log events with the given audit logger callback', async () => {
    const auditLogger = jest.fn()
    const auditEventCallback: AuditLoggingCallback = async (what, extraDetails) => auditLogger({ what, extraDetails })

    const { logAttempt, logSuccess, logFailure } = auditEventLoggers('TEST_EVENT', auditEventCallback)

    await logAttempt({ generic: 'extra details 1' })
    expect(auditLogger).toHaveBeenCalledWith({
      what: 'TEST_EVENT_ATTEMPT',
      extraDetails: { generic: 'extra details 1' },
    })
    auditLogger.mockReset()

    await logSuccess({ generic: 'extra details 2' })
    expect(auditLogger).toHaveBeenCalledWith({
      what: 'TEST_EVENT_SUCCESS',
      extraDetails: { generic: 'extra details 2' },
    })
    auditLogger.mockReset()

    await logFailure({ generic: 'extra details 3' })
    expect(auditLogger).toHaveBeenCalledWith({
      what: 'TEST_EVENT_FAILURE',
      extraDetails: { generic: 'extra details 3' },
    })
    auditLogger.mockReset()
  })
})

describe('auditLogged', () => {
  describe('when there is no error thrown from the work', () => {
    it('logs _ATTEMPT first then _SUCCESS performing any work', async () => {
      const loggedEvents: string[] = []
      const auditEventCallback: AuditLoggingCallback = async (what, _extraDetails) => {
        loggedEvents.push(what)
      }

      await auditLogged('TEST_EVENT', auditEventCallback, async () => {
        // noop
      })

      expect(loggedEvents).toEqual(['TEST_EVENT_ATTEMPT', 'TEST_EVENT_SUCCESS'])
    })
  })

  describe('when there is an error thrown from the work', () => {
    it('logs _ATTEMPT first then _FAILURE performing any work', async () => {
      const loggedEvents: string[] = []
      const loggedExtraDetails: object[] = []
      const auditEventCallback: AuditLoggingCallback = async (what, extraDetails = {}) => {
        loggedEvents.push(what)
        loggedExtraDetails.push(extraDetails)
      }

      try {
        await auditLogged('TEST_EVENT', auditEventCallback, async () => {
          throw new Error('FAILURE SOME HOW')
        })
      } catch (e) {
        expect((e as Error).message).toEqual('FAILURE SOME HOW')
      }

      expect(loggedEvents).toEqual(['TEST_EVENT_ATTEMPT', 'TEST_EVENT_FAILURE'])
      expect(loggedExtraDetails).toEqual([{}, { failureReason: 'FAILURE SOME HOW' }])
    })
  })
})
