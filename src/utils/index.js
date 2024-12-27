export function calculateCenter(points) {
    const total = points.length;
    const sum = points.reduce((acc, point) => {
        acc.x += point.x;
        acc.y += point.y;
        return acc;
    }, { x: 0, y: 0 });

    const centerX = sum.x / total;
    const centerY = sum.y / total;
    return { x: centerX, y: centerY };
}