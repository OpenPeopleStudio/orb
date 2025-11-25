/**
 * Reflection Engine
 *
 * Migrated from repo: supabase, path: functions/_shared/reflectionEngine.ts
 * Date: 2025-11-22
 * Role: OrbRole.TE (reflection/memory)
 *
 * Generates reflections and insights based on patterns and data analysis.
 */
import { OrbRole, getConfig, } from '@orb-system/core-orb';
// Alignment keywords for different personas/projects
const ALIGNMENT_KEYWORDS = {
    personal_os: ['software', 'technology', 'productivity', 'tools', 'apps'],
    real_estate: ['home', 'property', 'real estate', 'mortgage', 'renovation'],
    open_people: ['education', 'learning', 'books', 'courses', 'community'],
    growth: ['fitness', 'health', 'gym', 'wellness', 'therapy'],
};
/**
 * Generate reflection from transactions
 */
export async function generateReflection(ctx, transactions, userEmotion) {
    if (ctx.role !== OrbRole.TE) {
        console.warn(`generateReflection called with role ${ctx.role}, expected TE`);
    }
    if (transactions.length === 0) {
        return {
            summary: 'No transactions to analyze in this period.',
            alignment_score: null,
            tags: [],
            transaction_ids: [],
        };
    }
    // Build context
    const context = buildReflectionContext(transactions);
    // Calculate alignment score first (needed for tone selection)
    const alignment_score = calculateAlignmentScore(context);
    // Select tone based on context
    const tone = selectTone(context, alignment_score, userEmotion);
    // Generate reflection using AI with selected tone
    const config = getConfig();
    const openaiApiKey = config.openaiApiKey;
    if (!openaiApiKey) {
        throw new Error('OPENAI_API_KEY not configured');
    }
    const summary = await generateAISummary(context, openaiApiKey, ctx.deviceId || '', tone);
    // Generate tags
    const tags = generateTags(context);
    return {
        summary,
        alignment_score,
        tags,
        transaction_ids: transactions.map(t => t.id),
    };
}
function buildReflectionContext(transactions) {
    const merchantPatterns = {};
    const categoryBreakdown = {};
    let lateNight = 0;
    let weekend = 0;
    let weekday = 0;
    transactions.forEach(tx => {
        const amount = getTransactionAmount(tx);
        const merchant = (tx.merchant || tx.payee || 'unknown merchant').toLowerCase();
        const categoryName = getCategoryName(tx);
        const timestamp = getTimestamp(tx);
        // Merchant patterns
        merchantPatterns[merchant] = (merchantPatterns[merchant] || 0) + 1;
        // Category breakdown
        const cat = categoryName || 'uncategorized';
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + amount;
        // Time patterns
        const date = new Date(timestamp);
        const hour = date.getHours();
        const dayOfWeek = date.getDay();
        if (hour >= 22 || hour < 6) {
            lateNight += amount;
        }
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekend += amount;
        }
        else {
            weekday += amount;
        }
    });
    return {
        transactions,
        recentDays: 7, // Default to weekly
        merchantPatterns,
        categoryBreakdown,
        timePatterns: {
            lateNight,
            weekend,
            weekday,
        },
    };
}
function selectTone(context, alignmentScore, userEmotion) {
    // High alignment = celebratory or encouraging
    if (alignmentScore !== null && alignmentScore > 0.7) {
        return userEmotion?.valence && userEmotion.valence > 0.3 ? 'celebratory' : 'encouraging';
    }
    // Low alignment = compassionate or gentle
    if (alignmentScore !== null && alignmentScore < 0.3) {
        // If user is stressed, be gentle; otherwise compassionate
        if (userEmotion?.emotion === 'tense' || userEmotion?.emotion === 'overwhelmed') {
            return 'gentle';
        }
        return 'compassionate';
    }
    // Emotional spending patterns = gentle
    const totalSpend = context.transactions.reduce((sum, t) => sum + getTransactionAmount(t), 0);
    if (context.timePatterns.lateNight > totalSpend * 0.2) {
        return 'gentle';
    }
    // Default: analytical for neutral situations
    return 'analytical';
}
async function generateAISummary(context, openaiApiKey, deviceId, tone = 'analytical') {
    const totalSpend = context.transactions.reduce((sum, tx) => sum + getTransactionAmount(tx), 0);
    const avgTransaction = totalSpend / context.transactions.length;
    const topMerchants = Object.entries(context.merchantPatterns)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name]) => name);
    const topCategories = Object.entries(context.categoryBreakdown)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, amount]) => `${name}: $${amount.toFixed(2)}`);
    // Tone-specific guidance
    const toneGuidance = {
        celebratory: 'Be warm and celebratory. Acknowledge positive patterns and alignment with goals. Use encouraging language.',
        compassionate: 'Be compassionate and understanding. Acknowledge challenges without judgment. Offer gentle observations.',
        gentle: 'Be very gentle and supportive. The user may be experiencing stress or emotional spending. Be kind and non-critical.',
        encouraging: 'Be encouraging and positive. Highlight progress and growth. Use supportive, forward-looking language.',
        analytical: 'Be analytical and observational. Present facts clearly. Be neutral and informative.',
    };
    const prompt = `Analyze this week's spending patterns and generate a reflective insight.

Total spend: $${totalSpend.toFixed(2)}
Average transaction: $${avgTransaction.toFixed(2)}
Number of transactions: ${context.transactions.length}

Top merchants: ${topMerchants.join(', ')}

Category breakdown:
${topCategories.join('\n')}

Time patterns:
- Late night (10pm-6am): $${context.timePatterns.lateNight.toFixed(2)}
- Weekend: $${context.timePatterns.weekend.toFixed(2)}
- Weekday: $${context.timePatterns.weekday.toFixed(2)}

Tone: ${tone}
${toneGuidance[tone]}

Generate a concise, insightful reflection (2-3 sentences) that:
1. Highlights key spending patterns
2. Notes any emotional-spending indicators (late-night purchases, impulse patterns)
3. Identifies alignment with personal projects (Personal OS, Real Estate OS, Open People)
4. Points out any behavioral drift from stated goals

Match the ${tone} tone. Be observational and helpful, never judgmental.`;
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openaiApiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a financial reflection assistant that helps users understand their spending patterns with compassion and insight.',
                    },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 200,
            }),
        });
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'Unable to generate reflection at this time.';
    }
    catch (error) {
        console.error('Error generating AI summary:', error);
        return generateFallbackSummary(context);
    }
}
function generateFallbackSummary(context) {
    const totalSpend = context.transactions.reduce((sum, tx) => sum + getTransactionAmount(tx), 0);
    const topMerchant = Object.entries(context.merchantPatterns)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'various merchants';
    return `This week you spent $${totalSpend.toFixed(2)} across ${context.transactions.length} transactions, with most activity at ${topMerchant}.`;
}
function calculateAlignmentScore(context) {
    // Simple alignment scoring based on keyword matching
    // Returns 0-1 score where 1 is highly aligned
    let alignmentCount = 0;
    const totalTransactions = context.transactions.length;
    if (totalTransactions === 0)
        return null;
    context.transactions.forEach(tx => {
        const merchantLower = (tx.merchant || tx.payee || '').toLowerCase();
        const categoryLower = (getCategoryName(tx) || '').toLowerCase();
        for (const keywords of Object.values(ALIGNMENT_KEYWORDS)) {
            if (keywords.some(kw => merchantLower.includes(kw) || categoryLower.includes(kw))) {
                alignmentCount++;
                break;
            }
        }
    });
    return alignmentCount / totalTransactions;
}
function generateTags(context) {
    const tags = [];
    const totalSpend = context.transactions.reduce((sum, tx) => sum + getTransactionAmount(tx), 0);
    // Spending level tags
    if (totalSpend > 1000)
        tags.push('high_spend');
    if (totalSpend < 200)
        tags.push('low_spend');
    // Time pattern tags
    if (context.timePatterns.lateNight > totalSpend * 0.2)
        tags.push('late_night_spending');
    if (context.timePatterns.weekend > totalSpend * 0.5)
        tags.push('weekend_heavy');
    // Category tags
    const topCategory = Object.entries(context.categoryBreakdown)
        .sort(([, a], [, b]) => b - a)[0]?.[0];
    if (topCategory)
        tags.push(`category_${topCategory}`);
    // Pattern tags
    const uniqueMerchants = Object.keys(context.merchantPatterns).length;
    if (uniqueMerchants < context.transactions.length * 0.3)
        tags.push('repetitive_merchants');
    if (uniqueMerchants > context.transactions.length * 0.8)
        tags.push('diverse_spending');
    // Alignment tags
    const alignmentScore = calculateAlignmentScore(context);
    if (alignmentScore && alignmentScore > 0.5)
        tags.push('aligned');
    if (alignmentScore && alignmentScore < 0.2)
        tags.push('misaligned');
    return tags;
}
function getTransactionAmount(tx) {
    // Domain amounts are stored in cents
    return tx.amount / 100;
}
function getCategoryName(tx) {
    return tx.category?.name || tx.categoryId || undefined;
}
function getTimestamp(tx) {
    return tx.postedAt || tx.clearedAt || tx.date || tx.createdAt || new Date().toISOString();
}
//# sourceMappingURL=reflectionEngine.js.map