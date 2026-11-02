/**
 * Audit log recording for security-sensitive privileged operations (N-6).
 * Emits structured immutable log events for actions such as role changes,
 * status modifications, user deletions, and system configuration updates.
 */

export interface AuditLogEntry {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetId?: string | null;
  ipAddress?: string | null;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  const timestamp = entry.timestamp || new Date();
  const logPayload = {
    level: "AUDIT",
    timestamp: timestamp.toISOString(),
    action: entry.action,
    actorId: entry.actorId || "system",
    actorEmail: entry.actorEmail || undefined,
    targetId: entry.targetId || undefined,
    ipAddress: entry.ipAddress || undefined,
    metadata: entry.metadata || {},
  };

  // Structured JSON audit output to server stream (monitored by Docker, SIEM, syslog)
  console.info(`[AUDIT] ${JSON.stringify(logPayload)}`);
}

