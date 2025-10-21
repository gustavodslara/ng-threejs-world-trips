export const EARTH_CONSTANTS = {
  FOLDER_SIZE: 0.25,
  PHOTO_SPACING: 0.02,
  MIN_ZOOM: 1.01,
  MAX_ZOOM: 4,
  ZOOM_SENSITIVITY: 0.0005,
  ROTATE_SENSITIVITY: 0.2,
  DAMPING: 0.99,
  LERP_SPEED: 0.1,
  LOD_SWITCH_DISTANCE: 2.0,
};

export const LOD_LEVELS = {
  '4k': { maxDistance: 3.5, url: '4k' },
  '10k': { maxDistance: 1.01, url: '10k' }
};

export const TEXTURE_PATHS = {
  base: 'assets/images/earth/',
  texture: 'earth_texture_',
  bump: 'earth_bump_',
  specular: 'earth_specular_',
  extension: '.jpg'
};
