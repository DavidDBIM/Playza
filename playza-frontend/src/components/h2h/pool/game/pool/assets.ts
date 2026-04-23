import tableTopUrl from '../../assets/ref/img/tableTop.png'
import clothUrl from '../../assets/ref/img/cloth.png'
import pocketsUrl from '../../assets/ref/img/pockets.png'
import cueUrl from '../../assets/ref/img/cue.png'
import cueShadowUrl from '../../assets/ref/img/cueShadow.png'
import dottedLineUrl from '../../assets/ref/img/dottedLine.png'

import cueHitUrl from '../../assets/ref/audio/cueHit.wav'
import ballHitUrl from '../../assets/ref/audio/ballHit2.wav'
import cushionHitUrl from '../../assets/ref/audio/cushionHit.wav'
import pocketHitUrl from '../../assets/ref/audio/pocketHit.wav'

export type PoolImageKey =
  | 'tableTop'
  | 'cloth'
  | 'pockets'
  | 'cue'
  | 'cueShadow'
  | 'dottedLine'

export type PoolAudioKey = 'cueHit' | 'ballHit' | 'cushionHit' | 'pocketHit'

export interface PoolAssets {
  images: Partial<Record<PoolImageKey, HTMLImageElement>>
  audio: Partial<Record<PoolAudioKey, HTMLAudioElement>>
}

export const POOL_ASSET_URLS: Record<PoolImageKey | PoolAudioKey, string> = {
  tableTop: tableTopUrl,
  cloth: clothUrl,
  pockets: pocketsUrl,
  cue: cueUrl,
  cueShadow: cueShadowUrl,
  dottedLine: dottedLineUrl,
  cueHit: cueHitUrl,
  ballHit: ballHitUrl,
  cushionHit: cushionHitUrl,
  pocketHit: pocketHitUrl,
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function createAudio(src: string, volume: number) {
  const audio = new Audio(src)
  audio.preload = 'auto'
  audio.volume = volume
  return audio
}

export async function loadPoolAssets(): Promise<PoolAssets> {
  const [tableTop, cloth, pockets, cue, cueShadow, dottedLine] = await Promise.all([
    loadImage(POOL_ASSET_URLS.tableTop),
    loadImage(POOL_ASSET_URLS.cloth),
    loadImage(POOL_ASSET_URLS.pockets),
    loadImage(POOL_ASSET_URLS.cue),
    loadImage(POOL_ASSET_URLS.cueShadow),
    loadImage(POOL_ASSET_URLS.dottedLine),
  ])

  return {
    images: { tableTop, cloth, pockets, cue, cueShadow, dottedLine },
    audio: {
      cueHit: createAudio(POOL_ASSET_URLS.cueHit, 0.5),
      ballHit: createAudio(POOL_ASSET_URLS.ballHit, 0.55),
      cushionHit: createAudio(POOL_ASSET_URLS.cushionHit, 0.45),
      pocketHit: createAudio(POOL_ASSET_URLS.pocketHit, 0.6),
    },
  }
}
