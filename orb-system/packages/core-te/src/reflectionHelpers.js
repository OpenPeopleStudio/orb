/**
 * Te Reflection Helpers
 *
 * Types and utilities for Te reflections.
 */
/**
 * Create a Te reflection from context and data
 */
export function createTeReflection(context, data) {
    return {
        id: crypto.randomUUID(),
        input: data.input,
        output: data.output,
        tags: data.tags,
        notes: data.notes,
        createdAt: new Date(),
    };
}
//# sourceMappingURL=reflectionHelpers.js.map