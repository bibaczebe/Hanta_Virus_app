import NodeCache from 'node-cache';

const cache = new NodeCache({ checkperiod: 600, useClones: false });

export function get(key) {
  return cache.get(key);
}

export function set(key, value, ttlSeconds) {
  return cache.set(key, value, ttlSeconds);
}

export function has(key) {
  return cache.has(key);
}

export function del(key) {
  return cache.del(key);
}

export function stats() {
  return {
    keys: cache.keys(),
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    ksize: cache.getStats().ksize,
    vsize: cache.getStats().vsize,
  };
}

export default { get, set, has, del, stats };
