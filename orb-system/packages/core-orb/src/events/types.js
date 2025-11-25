/**
 * Event Types
 *
 * Role: Core event system
 *
 * Event bus for learning loop and adaptation.
 * Phase 6: Learning loop foundation.
 */
/**
 * Event Type - categories of events for learning loop
 *
 * Phase 6: Enhanced event taxonomy for learning & adaptation
 */
export var OrbEventType;
(function (OrbEventType) {
    // Mav action events
    OrbEventType["ACTION_STARTED"] = "action_started";
    OrbEventType["ACTION_COMPLETED"] = "action_completed";
    OrbEventType["ACTION_FAILED"] = "action_failed";
    // Luna decision events
    OrbEventType["DECISION_MADE"] = "decision_made";
    OrbEventType["CONSTRAINT_TRIGGERED"] = "constraint_triggered";
    OrbEventType["PREFERENCE_UPDATED"] = "preference_updated";
    OrbEventType["MODE_CHANGED"] = "mode_changed";
    // Te reflection events
    OrbEventType["REFLECTION_CREATED"] = "reflection_created";
    OrbEventType["PATTERN_DETECTED"] = "pattern_detected";
    OrbEventType["INSIGHT_GENERATED"] = "insight_generated";
    // Sol inference events
    OrbEventType["MODEL_CALLED"] = "model_called";
    OrbEventType["INTENT_ANALYZED"] = "intent_analyzed";
    OrbEventType["RECOMMENDATION_MADE"] = "recommendation_made";
    // User events
    OrbEventType["USER_ACTION"] = "user_action";
    OrbEventType["USER_FEEDBACK"] = "user_feedback";
    OrbEventType["SESSION_STARTED"] = "session_started";
    OrbEventType["SESSION_ENDED"] = "session_ended";
    // Legacy/compatibility events (Phase 4)
    OrbEventType["TASK_RUN"] = "task_run";
    OrbEventType["TASK_COMPLETE"] = "task_complete";
    OrbEventType["TASK_FAIL"] = "task_fail";
    OrbEventType["USER_INPUT"] = "user_input";
    OrbEventType["MODE_CHANGE"] = "mode_change";
    OrbEventType["ERROR"] = "error";
    OrbEventType["WARNING"] = "warning";
    OrbEventType["INFO"] = "info";
    OrbEventType["REFLECTION"] = "reflection";
    OrbEventType["EVALUATION"] = "evaluation";
    OrbEventType["LUNA_DECISION"] = "luna_decision";
    OrbEventType["LUNA_ALLOW"] = "luna_allow";
    OrbEventType["LUNA_DENY"] = "luna_deny";
    OrbEventType["LUNA_REQUIRE_CONFIRMATION"] = "luna_require_confirmation";
    // Legacy Mav actions
    OrbEventType["MAV_ACTION"] = "mav_action";
    OrbEventType["FILE_WRITE"] = "file_write";
    OrbEventType["FILE_READ"] = "file_read";
    OrbEventType["TE_EVALUATION"] = "te_evaluation";
    OrbEventType["TE_REFLECTION"] = "te_reflection";
})(OrbEventType || (OrbEventType = {}));
//# sourceMappingURL=types.js.map