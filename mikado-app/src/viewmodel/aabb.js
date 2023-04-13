/**
 * Returns a function that returns true when another node intersects this one.
 */
export default function createIntersectionDetectorFor(nodeLike) {
  // Convert this node's size offsets into absolute coordinates
  const { id, position: { x: myLeft, y: myTop } } = nodeLike;
  const myRight = myLeft + nodeLike.width, myBottom = myTop + nodeLike.height;
  return other => {
    // Convert other node's size offsets into absolute coordinates
    const { x: otherLeft, y: otherTop } = other.position;
    const otherRight = otherLeft + other.width, otherBottom = otherTop + other.height;

    if (!(other.id === id // Ignore self-intersection, or else it will always return true
    || myRight < otherLeft // I'm to your right, with a vertical line between us
    || myLeft > otherRight // I'm to your left, with a vertical line between us
    || myTop > otherBottom // I'm below you, with a horizontal line between us
    || myBottom < otherTop // I'm above you, with a horizontal line between us
  )) {
    console.log(nodeLike)
    console.log(other)
    console.log(myRight)
    console.log(myLeft)
    console.log(myTop)
    console.log(myBottom)

    console.log("-------------")
    console.log(otherLeft)
    console.log(otherRight)
    console.log(otherBottom)
    console.log(otherTop)
    console.log("--------------")
    console.log(myRight < otherLeft)
    console.log(myLeft > otherRight)
    console.log(myTop > otherBottom)
    console.log(myBottom < otherTop)
  }
    // To know when two nodes intersect, just consider the contrapositive
    return !(other.id === id // Ignore self-intersection, or else it will always return true
      || myRight < otherLeft // I'm to your right, with a vertical line between us
      || myLeft > otherRight // I'm to your left, with a vertical line between us
      || myTop > otherBottom // I'm below you, with a horizontal line between us
      || myBottom < otherTop // I'm above you, with a horizontal line between us
    );
  };
}
