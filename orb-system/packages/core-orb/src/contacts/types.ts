/**
 * Contacts Types
 * 
 * Role: Core contacts layer
 * 
 * Types for contact graph, relationships, and emotional signals.
 * Ported from SomaOS contacts architecture.
 * 
 * Source: SomaOS CONTACTS_COMPLETE_DATABASE_REQUIREMENTS.md
 */

/**
 * Contact Relationship Type
 */
export enum ContactRelationshipType {
  FAMILY = 'family',
  FRIEND = 'friend',
  COLLEAGUE = 'colleague',
  ACQUAINTANCE = 'acquaintance',
  BUSINESS = 'business',
  OTHER = 'other',
}

/**
 * Emotional Signal - emotional state or sentiment
 */
export enum EmotionalSignal {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral',
  EXCITED = 'excited',
  STRESSED = 'stressed',
  HAPPY = 'happy',
  SAD = 'sad',
  ANGRY = 'angry',
  CALM = 'calm',
}

/**
 * Contact - represents a person in the contact graph
 */
export interface Contact {
  id: string;
  userId: string; // Owner of this contact
  
  // Identity
  name: string;
  firstName?: string;
  lastName?: string;
  nickname?: string;
  
  // Communication
  email?: string[];
  phone?: string[];
  addresses?: ContactAddress[];
  
  // Relationship
  relationshipType: ContactRelationshipType;
  relationshipNotes?: string;
  
  // Emotional signals (recent)
  recentEmotionalSignals?: EmotionalSignal[];
  lastInteractionAt?: string; // ISO timestamp
  
  // Metadata
  tags?: string[];
  notes?: string;
  avatarUrl?: string;
  
  // Timestamps
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  
  metadata?: Record<string, unknown>;
}

/**
 * Contact Address
 */
export interface ContactAddress {
  type: 'home' | 'work' | 'other';
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

/**
 * Contact Interaction - record of interaction with a contact
 */
export interface ContactInteraction {
  id: string;
  contactId: string;
  userId: string;
  
  // Interaction details
  type: 'email' | 'sms' | 'call' | 'meeting' | 'message' | 'other';
  channel?: string;
  direction: 'inbound' | 'outbound';
  
  // Emotional signal
  emotionalSignal?: EmotionalSignal;
  sentiment?: number; // -1 to 1
  
  // Content
  subject?: string;
  summary?: string;
  
  // Timestamp
  occurredAt: string; // ISO timestamp
  
  // Metadata
  metadata?: Record<string, unknown>;
}

/**
 * Contact Graph - relationships between contacts
 */
export interface ContactGraph {
  userId: string;
  contacts: Contact[];
  relationships: ContactRelationship[];
  interactions: ContactInteraction[];
}

/**
 * Contact Relationship - relationship between two contacts
 */
export interface ContactRelationship {
  id: string;
  userId: string;
  contactId1: string;
  contactId2: string;
  relationshipType: ContactRelationshipType;
  notes?: string;
  strength?: number; // 0 to 1, how strong the relationship is
  createdAt: string; // ISO timestamp
}

/**
 * Contact Filter - for querying contacts
 */
export interface ContactFilter {
  userId: string;
  relationshipType?: ContactRelationshipType;
  tags?: string[];
  search?: string; // Name search
  hasEmail?: boolean;
  hasPhone?: boolean;
  lastInteractionAfter?: string; // ISO timestamp
}

