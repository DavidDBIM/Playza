import tableTopUrl from '../../assets/img/tableTop.png'
import clothUrl from '../../assets/img/cloth.png'
import pocketsUrl from '../../assets/img/pockets.png'
import cueUrl from '../../assets/img/cue.png'
import cueShadowUrl from '../../assets/img/cueShadow.png'
import dottedLineUrl from '../../assets/img/dottedLine.png'
import shadowUrl from '../../assets/img/shadow.png'
import shadeUrl from '../../assets/img/shade.png'
import spotSpriteSheetUrl from '../../assets/img/spotSpriteSheet.png'
import solidsSpriteSheetUrl from '../../assets/img/solidsSpriteSheet.png'
import ballSpriteSheet9Url from '../../assets/img/ballSpriteSheet9.png'
import ballSpriteSheet10Url from '../../assets/img/ballSpriteSheet10.png'
import ballSpriteSheet11Url from '../../assets/img/ballSpriteSheet11.png'
import ballSpriteSheet12Url from '../../assets/img/ballSpriteSheet12.png'
import ballSpriteSheet13Url from '../../assets/img/ballSpriteSheet13.png'
import ballSpriteSheet14Url from '../../assets/img/ballSpriteSheet14.png'
import ballSpriteSheet15Url from '../../assets/img/ballSpriteSheet15.png'

import cueHitUrl from '../../assets/audio/cueHit.wav'
import ballHitUrl from '../../assets/audio/ballHit2.wav'
import cushionHitUrl from '../../assets/audio/cushionHit.wav'
import pocketHitUrl from '../../assets/audio/pocketHit.wav'

export type PoolImageKey =
  | 'tableTop'
  | 'cloth'
  | 'pockets'
  | 'cue'
  | 'cueShadow'
  | 'dottedLine'
  | 'shadow'
  | 'shade'
  | 'spotSpriteSheet'
  | 'solidsSpriteSheet'
  | 'ballSpriteSheet9'
  | 'ballSpriteSheet10'
  | 'ballSpriteSheet11'
  | 'ballSpriteSheet12'
  | 'ballSpriteSheet13'
  | 'ballSpriteSheet14'
  | 'ballSpriteSheet15'

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
  shadow: shadowUrl,
  shade: shadeUrl,
  spotSpriteSheet: spotSpriteSheetUrl,
  solidsSpriteSheet: solidsSpriteSheetUrl,
  ballSpriteSheet9: ballSpriteSheet9Url,
  ballSpriteSheet10: ballSpriteSheet10Url,
  ballSpriteSheet11: ballSpriteSheet11Url,
  ballSpriteSheet12: ballSpriteSheet12Url,
  ballSpriteSheet13: ballSpriteSheet13Url,
  ballSpriteSheet14: ballSpriteSheet14Url,
  ballSpriteSheet15: ballSpriteSheet15Url,
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
  const [
    tableTop,
    cloth,
    pockets,
    cue,
    cueShadow,
    dottedLine,
    shadow,
    shade,
    spotSpriteSheet,
    solidsSpriteSheet,
    ballSpriteSheet9,
    ballSpriteSheet10,
    ballSpriteSheet11,
    ballSpriteSheet12,
    ballSpriteSheet13,
    ballSpriteSheet14,
    ballSpriteSheet15,
  ] = await Promise.all([
    loadImage(POOL_ASSET_URLS.tableTop),
    loadImage(POOL_ASSET_URLS.cloth),
    loadImage(POOL_ASSET_URLS.pockets),
    loadImage(POOL_ASSET_URLS.cue),
    loadImage(POOL_ASSET_URLS.cueShadow),
    loadImage(POOL_ASSET_URLS.dottedLine),
    loadImage(POOL_ASSET_URLS.shadow),
    loadImage(POOL_ASSET_URLS.shade),
    loadImage(POOL_ASSET_URLS.spotSpriteSheet),
    loadImage(POOL_ASSET_URLS.solidsSpriteSheet),
    loadImage(POOL_ASSET_URLS.ballSpriteSheet9),
    loadImage(POOL_ASSET_URLS.ballSpriteSheet10),
    loadImage(POOL_ASSET_URLS.ballSpriteSheet11),
    loadImage(POOL_ASSET_URLS.ballSpriteSheet12),
    loadImage(POOL_ASSET_URLS.ballSpriteSheet13),
    loadImage(POOL_ASSET_URLS.ballSpriteSheet14),
    loadImage(POOL_ASSET_URLS.ballSpriteSheet15),
  ])

  return {
    images: {
      tableTop,
      cloth,
      pockets,
      cue,
      cueShadow,
      dottedLine,
      shadow,
      shade,
      spotSpriteSheet,
      solidsSpriteSheet,
      ballSpriteSheet9,
      ballSpriteSheet10,
      ballSpriteSheet11,
      ballSpriteSheet12,
      ballSpriteSheet13,
      ballSpriteSheet14,
      ballSpriteSheet15,
    },
    audio: {
      cueHit: createAudio(POOL_ASSET_URLS.cueHit, 0.5),
      ballHit: createAudio(POOL_ASSET_URLS.ballHit, 0.55),
      cushionHit: createAudio(POOL_ASSET_URLS.cushionHit, 0.45),
      pocketHit: createAudio(POOL_ASSET_URLS.pocketHit, 0.6),
    },
  }
}
