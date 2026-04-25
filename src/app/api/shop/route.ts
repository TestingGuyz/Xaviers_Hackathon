// ============================================================
// POST /api/shop — Buy or toggle accessories
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { getAccessoryById } from '@/lib/accessories';

export async function POST(req: Request) {
  try {
    const { action, accessoryId } = await req.json();
    const accessory = getAccessoryById(accessoryId);
    
    if (!accessory) {
      return NextResponse.json({ error: 'Accessory not found' }, { status: 404 });
    }
    
    const status = db.getLatestStatus();
    
    if (action === 'buy') {
      const owned = db.getOwnedAccessories();
      if (owned.includes(accessoryId)) {
        return NextResponse.json({ error: 'Already owned' }, { status: 400 });
      }
      
      if (status.xp < accessory.cost) {
        return NextResponse.json({ error: 'Not enough XP' }, { status: 400 });
      }
      
      // Deduct XP and buy
      const newStatus = { ...status, xp: status.xp - accessory.cost };
      db.updateStatus(newStatus);
      db.buyAccessory(accessoryId);
      
      return NextResponse.json({
        success: true,
        state: newStatus,
        owned: db.getOwnedAccessories(),
        equipped: db.getEquippedAccessories(),
      });
    }
    
    if (action === 'toggle') {
      const equipped = db.toggleAccessory(accessoryId);
      return NextResponse.json({
        success: true,
        equipped: db.getEquippedAccessories(),
        isEquipped: equipped,
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Shop error:', error);
    return NextResponse.json({ error: 'Shop operation failed' }, { status: 500 });
  }
}
