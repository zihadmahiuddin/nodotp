export default class TotpCounter {
  constructor(public timeStep: number, public startTime = 0) {
    if (timeStep < 1) {
      throw new Error(`Time step must be positive: ${timeStep}`);
    }
    this.assertValidTime(startTime);
  }

  getValue(time = Date.now() / 1000) {
    this.assertValidTime(time);

    const timeSinceStartTime = time - this.startTime;
    if (timeSinceStartTime >= 0) {
      return Math.floor(timeSinceStartTime / this.timeStep);
    } else {
      return Math.floor(
        (timeSinceStartTime - (this.timeStep - 1)) / this.timeStep
      );
    }
  }

  getValueStartTime(value: number) {
    return this.startTime + value * this.timeStep;
  }

  private assertValidTime(time: number) {
    if (time < 0) {
      throw new Error("Negative time: " + time);
    }
  }
}
