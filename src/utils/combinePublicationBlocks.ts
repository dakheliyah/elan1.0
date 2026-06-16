import { ParentBlockData, Publication } from '@/pages/PublicationEditor';
import { USE_UMOOR_ORDER_PREFERENCE } from '@/constants/publicationFeatures';

export type UmoorWithOrder = { id: string; order_preference?: number | null };

/**
 * Resolves the parent blocks that should appear in preview/export.
 * Honors USE_UMOOR_ORDER_PREFERENCE for sort strategy.
 */
export function getCombinedParentBlocks(
  publication: Publication,
  hostPublication?: Publication | null,
  umoors: UmoorWithOrder[] = []
): ParentBlockData[] {
  const pubBlocks = publication.parentBlocks || [];
  const hostBlocks = hostPublication?.parentBlocks || [];

  const allBlocks =
    hostBlocks.length > 0
      ? [...hostBlocks.filter((block) => block.isGlobal), ...pubBlocks]
      : pubBlocks;

  if (!USE_UMOOR_ORDER_PREFERENCE) {
    return getBlocksInInsertionOrder(allBlocks, hostPublication);
  }

  return getBlocksByUmoorOrderPreference(allBlocks, umoors);
}

function getBlocksInInsertionOrder(
  allBlocks: ParentBlockData[],
  hostPublication?: Publication | null
): ParentBlockData[] {
  if (!hostPublication) {
    return allBlocks;
  }

  const globalUmoorIds = new Set(
    (hostPublication.parentBlocks || [])
      .filter((block) => block.isGlobal)
      .map((block) => block.umoorId)
  );

  const result: ParentBlockData[] = [];

  for (const block of allBlocks) {
    if (!block.isGlobal && globalUmoorIds.has(block.umoorId)) {
      const alreadyHasGlobal = result.some(
        (existing) => existing.umoorId === block.umoorId && existing.isGlobal
      );
      if (alreadyHasGlobal) {
        continue;
      }
    }

    result.push(block);
  }

  return result;
}

function getBlocksByUmoorOrderPreference(
  allBlocks: ParentBlockData[],
  umoors: UmoorWithOrder[]
): ParentBlockData[] {
  const groupedBlocks: {
    umoorId: string;
    blocks: ParentBlockData[];
    isGlobal: boolean;
    orderPreference: number;
  }[] = [];
  const umoorMap = new Map<
    string,
    { blocks: ParentBlockData[]; isGlobal: boolean; orderPreference: number }
  >();

  allBlocks.forEach((block) => {
    if (!umoorMap.has(block.umoorId)) {
      const umoorData = umoors.find((umoor) => umoor.id === block.umoorId);
      const orderPreference = umoorData?.order_preference || 0;

      const groupData = {
        blocks: [] as ParentBlockData[],
        isGlobal: block.isGlobal || false,
        orderPreference,
      };
      umoorMap.set(block.umoorId, groupData);
      groupedBlocks.push({ umoorId: block.umoorId, ...groupData });
    }
    umoorMap.get(block.umoorId)!.blocks.push(block);
  });

  groupedBlocks.sort((a, b) => {
    if (a.orderPreference > 0 && b.orderPreference === 0) return -1;
    if (a.orderPreference === 0 && b.orderPreference > 0) return 1;

    if (a.orderPreference > 0 && b.orderPreference > 0) {
      if (a.orderPreference !== b.orderPreference) {
        return a.orderPreference - b.orderPreference;
      }
    }

    if (a.isGlobal && !b.isGlobal) return -1;
    if (!a.isGlobal && b.isGlobal) return 1;

    return 0;
  });

  return groupedBlocks.flatMap((group) => group.blocks);
}
