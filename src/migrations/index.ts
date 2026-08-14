import * as migration_20260813_234610_init_articles from './20260813_234610_init_articles';
import * as migration_20260814_001723_r2_storage from './20260814_001723_r2_storage';

export const migrations = [
  {
    up: migration_20260813_234610_init_articles.up,
    down: migration_20260813_234610_init_articles.down,
    name: '20260813_234610_init_articles',
  },
  {
    up: migration_20260814_001723_r2_storage.up,
    down: migration_20260814_001723_r2_storage.down,
    name: '20260814_001723_r2_storage',
  },
];
