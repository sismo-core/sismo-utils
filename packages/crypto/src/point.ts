export class Point {
  x: bigint;
  y: bigint;

  constructor(x: bigint, y: bigint) {
    this.x = x;
    this.y = y;
  }

  public static fromArray(arr: bigint[]): Point {
    return new Point(arr[0], arr[1]);
  }
}
