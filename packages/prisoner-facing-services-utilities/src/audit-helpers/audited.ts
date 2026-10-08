/**
 * Example implementation:
 * ```
 * const callback: AuditLoggingCallback = async (what, details) => {
 *   await auditService.logAuditEvent({ what, details, who: req.user.username, correlationId: req.id })
 * }
 * ```
 */
export type AuditLoggingCallback = (auditWhat: string, extraDetails?: object) => Promise<void>

/**
 * An AuditLoggingCallback that is curried to the AuditEvent['what']
 */
export type AuditEventSpecificLoggingCallback = (extraDetails?: object) => Promise<void>


/**
 * Allows you to run arbitrary code and have it be audit logged in the correct format, via the auditLoggingCallback.
 *
 * For example given an auditEventPrefix of VIEW_PRISONER_DETAILS the auditLoggingCallback will be invoked with the following 'what's:
 * - 1,  VIEW_PRISONER_DETAILS_ATTEMPT - before calling the provided code
 * - 2A, VIEW_PRISONER_DETAILS_SUCCESS - ONLY if no error was raised when calling the code
 * - 2B, VIEW_PRISONER_DETAILS_FAILURE - ONLY if an error was raised when calling the code
 *
 * @see AuditLoggingCallback
 * @param auditEventPrefix
 * @param auditLoggingCallback
 * @param workToBeAudited
 */
export const auditLogged = async (
  auditEventPrefix: string,
  auditLoggingCallback: AuditLoggingCallback,
  workToBeAudited: () => Promise<void>,
) => {
  const { logAttempt, logSuccess, logFailure } = auditEventLoggers(auditEventPrefix, auditLoggingCallback)

  await logAttempt()

  try {
    await workToBeAudited()

    await logSuccess()
  } catch (e) {
    await logFailure({ failureReason: (e as Error).message })

    throw e
  }
}

/**
 * Provides a set of pre-configured auditLoggingCallbacks to be run under your control.
 *
 * For example given an auditPrefix of VIEW_PRISONER_DETAILS your will receive your auditLoggingCallback curried to:
 * - 1, logAttempt - when called will log an audit event of VIEW_PRISONER_DETAILS_ATTEMPT
 * - 2, logSuccess - when called will log an audit event of VIEW_PRISONER_DETAILS_SUCCESS
 * - 3, logFailure - when called will log an audit event of VIEW_PRISONER_DETAILS_FAILURE
 *
 * @see AuditLoggingCallback
 * @param auditEventPrefix
 * @param auditLoggingCallback
 */
export const auditEventLoggers = (auditEventPrefix: string,
  auditLoggingCallback: AuditLoggingCallback,
): {
  logAttempt: AuditEventSpecificLoggingCallback
  logSuccess: AuditEventSpecificLoggingCallback
  logFailure: AuditEventSpecificLoggingCallback
} => {
  return {
    logAttempt: (extraDetails: object = {}) => auditLoggingCallback(`${auditEventPrefix}_ATTEMPT`, extraDetails),
    logSuccess: (extraDetails: object = {}) => auditLoggingCallback(`${auditEventPrefix}_SUCCESS`, extraDetails),
    logFailure: (extraDetails: object = {}) => auditLoggingCallback(`${auditEventPrefix}_FAILURE`, extraDetails),
  }
}
