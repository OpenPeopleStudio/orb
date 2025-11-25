/**
 * Adaptation Types
 *
 * Phase 6: Learning loop type system
 *
 * Defines patterns, insights, and learning actions for the
 * adaptation engine.
 */
/**
 * Confidence Threshold - for auto-applying learnings
 */
export var ConfidenceThreshold;
(function (ConfidenceThreshold) {
    ConfidenceThreshold[ConfidenceThreshold["AUTO_APPLY"] = 0.9] = "AUTO_APPLY";
    ConfidenceThreshold[ConfidenceThreshold["SUGGEST"] = 0.7] = "SUGGEST";
    ConfidenceThreshold[ConfidenceThreshold["LOG_ONLY"] = 0.5] = "LOG_ONLY";
    ConfidenceThreshold[ConfidenceThreshold["IGNORE"] = 0] = "IGNORE";
})(ConfidenceThreshold || (ConfidenceThreshold = {}));
//# sourceMappingURL=types.js.map