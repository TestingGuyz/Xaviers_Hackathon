// ============================================================
// GET /api/state — Returns current pet state + DNA
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  try {
    const status = db.getLatestStatus();
    const dna = db.getLatestDNA();
    const equippedAccessories = db.getEquippedAccessories();
    const ownedAccessories = db.getOwnedAccessories();
    const dailyTasks = db.getDailyTasks();
    const journalCount = db.getLockedJournalCount(status.syncFrequency);
    
    return NextResponse.json({
      status,
      dna,
      equippedAccessories,
      ownedAccessories,
      dailyTasks,
      lockedJournalCount: journalCount,
    });
  } catch (error) {
    console.error('State error:', error);
    return NextResponse.json({ error: 'Failed to get state' }, { status: 500 });
  }
}
