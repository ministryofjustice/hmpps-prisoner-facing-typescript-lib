export type AuditLoggingCallback = (auditWhat: string, extraDetails?: object) => Promise<void>
export type AuditEventSpecificLoggingCallback = (extraDetails?: object) => Promise<void>

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

const logIt: AuditLoggingCallback = async (auditEvent) => {
  console.log(auditEvent)
}


//
// /**
//  * Allows you to run arbitrary code and have it be audit logged in the correct format.
//  *
//  * For example given an auditPrefix of VIEW_PRISONER_DETAILS it will log the following audit events:
//  * - 1,  VIEW_PRISONER_DETAILS_ATTEMPT - before calling the provided code
//  * - 2A, VIEW_PRISONER_DETAILS_SUCCESS - ONLY if no error was raised when calling the code
//  * - 2B, VIEW_PRISONER_DETAILS_FAILURE - ONLY if an error was raised when calling the code
//  *
//  * In the event of an error being raised, it will rethrow it so that the generic error handler
//  * can still function as expected.
//  *
//  * @see AuditSetupDetails
//  *
//  * @param auditSetupDetails
//  * @param work
//  */
// export const doWithAuditLogging = async (auditSetupDetails: AuditSetupDetails, work: () => Promise<void>) => {
//   const { logAttempt, logSuccess, logFailure } = auditLoggersFor({ ...auditSetupDetails })
//
//   await logAttempt()
//
//   try {
//     await work()
//
//     await logSuccess()
//   } catch (e) {
//     await logFailure({ error: e })
//
//     throw e
//   }
// }
//
// /**
//  * Provides a set of pre-configured audit loggers to be run under your control.
//  *
//  * For example given an auditPrefix of VIEW_PRISONER_DETAILS you will receive the following loggers:
//  * - 1, logAttempt - when called will log an audit event of VIEW_PRISONER_DETAILS_ATTEMPT
//  * - 2, logSuccess - when called will log an audit event of VIEW_PRISONER_DETAILS_SUCCESS
//  * - 3, logFailure - when called will log an audit event of VIEW_PRISONER_DETAILS_FAILURE
//  *
//  * It is intended to provide fine-grained control of audit logging (e.g. the need to add extra details).
//  * Please consider using doWithAuditLogging first.
//  *
//  * @see AuditSetupDetails
//  *
//  * @param auditSetupDetails
//  */
// export const auditLoggersFor = ({
//                                   auditPrefix,
//                                   req,
//                                   auditService,
//                                   coreAuditEvent,
//                                 }: AuditSetupDetails): EventLoggers => {
//   const eventLogger =
//     (event: 'ATTEMPT' | 'SUCCESS' | 'FAILURE'): EventLogger =>
//       async ({ error, extraDetails } = {}) =>
//         auditService.logAuditEvent({
//           ...coreAuditEvent,
//           correlationId: req.id,
//           who: req.user.username,
//           what: `${auditPrefix}_${event}`,
//           details: {
//             ...(coreAuditEvent.details ?? {}),
//             ...(error ? { failureReason: error.message } : {}),
//             ...(extraDetails ?? {}),
//           },
//         })
//
//   return {
//     logAttempt: eventLogger('ATTEMPT'),
//     logSuccess: eventLogger('SUCCESS'),
//     logFailure: eventLogger('FAILURE'),
//   }
// }
