/**
 * Object Pool
 * Reuses objects to reduce garbage collection and improve performance
 */

export class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.active = new Set();
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  get() {
    let obj;
    if (this.pool.length > 0) {
      obj = this.pool.pop();
    } else {
      obj = this.createFn();
    }
    this.active.add(obj);
    return obj;
  }

  release(obj) {
    if (this.active.has(obj)) {
      this.active.delete(obj);
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  releaseAll() {
    for (const obj of this.active) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
    this.active.clear();
  }

  getActiveCount() {
    return this.active.size;
  }

  getPoolSize() {
    return this.pool.length;
  }
}
