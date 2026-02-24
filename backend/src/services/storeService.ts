import express from 'express';
import { z } from 'zod';
import { store } from '../data/store.js';
import { logEventWithPersistence } from '../core/eventLogger.js';
import type { PostgresAdapter } from '../data/postgres.js';

/** Transparent cosmetics store (non-pay-to-win). */
export function createStoreService(db: PostgresAdapter | null): express.Express {
  const app = express();
  app.use(express.json());

  app.get('/store/catalog', (_req, res) => {
    return res.json({
      policy: {
        noPayToWin: true,
        lootboxesForMinors: false,
        oddsDisclosure: 'All items are direct purchase; no random rewards sold for currency.'
      },
      skus: store.storeSkus
    });
  });

  app.post('/store/purchase', async (req, res) => {
    const parsed = z
      .object({
        player_id: z.string(),
        sku_id: z.string()
      })
      .safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const player = store.players.get(parsed.data.player_id);
    const sku = store.storeSkus.find((s) => s.id === parsed.data.sku_id);
    if (!player || !sku) {
      return res.status(404).json({ error: 'Player or SKU not found' });
    }

    if (sku.priceCents > player.settings.spendCapCents) {
      return res.status(403).json({ error: 'Purchase blocked by spend cap', spend_cap_cents: player.settings.spendCapCents });
    }

    player.cosmetics.push(sku.id);
    await logEventWithPersistence(db, {
      playerId: player.id,
      name: 'store_purchase',
      payload: { skuId: sku.id, priceCents: sku.priceCents }
    });

    return res.status(201).json({ ok: true, granted: sku.id });
  });

  return app;
}
