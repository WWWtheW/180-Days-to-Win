window.ElectionSim.utils.Random = class Random {
  constructor(seed = 123456) {
    this.seed = seed;
  }

  next() {
    // xorshift32
    let x = this.seed;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    this.seed = x;
    return (x >>> 0) / 4294967296;
  }

  range(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  float(min, max) {
    return this.next() * (max - min) + min;
  }

  pick(arr) {
    return arr[Math.floor(this.next() * arr.length)];
  }

  chance(p) {
    return this.next() < p;
  }
};