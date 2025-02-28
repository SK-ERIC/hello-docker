const gridSize = 8;
const cellSize = 2;
const pieceHeight = 1;
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
let grid = [];
let selectedPiece = null;

// 场景设置
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 灯光
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// 创建网格
function createGrid() {
    const gridGeometry = new THREE.BoxGeometry(gridSize * cellSize, 0.2, gridSize * cellSize);
    const gridMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    scene.add(gridMesh);

    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            const piece = createPiece(i, j);
            grid[i][j] = piece;
            scene.add(piece);
        }
    }
}

// 创建方块
function createPiece(row, col) {
    const geometry = new THREE.BoxGeometry(cellSize * 0.9, pieceHeight, cellSize * 0.9);
    const material = new THREE.MeshPhongMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
    const piece = new THREE.Mesh(geometry, material);
    piece.position.set(
        (col - (gridSize - 1) / 2) * cellSize,
        pieceHeight / 2,
        (row - (gridSize - 1) / 2) * cellSize
    );
    piece.row = row;
    piece.col = col;
    return piece;
}

// 鼠标交互
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const piece = intersects[0].object;
        if (selectedPiece) {
            if (isAdjacent(selectedPiece, piece)) {
                swapPieces(selectedPiece, piece);
                checkMatches();
            }
            selectedPiece.material.color.set(selectedPiece.material.color.getHex());
            selectedPiece = null;
        } else {
            selectedPiece = piece;
            piece.material.color.set(0xffffff);
        }
    }
}

// 检查是否相邻
function isAdjacent(piece1, piece2) {
    return Math.abs(piece1.row - piece2.row) + Math.abs(piece1.col - piece2.col) === 1;
}

// 交换方块
function swapPieces(piece1, piece2) {
    const tempRow = piece1.row;
    const tempCol = piece1.col;
    piece1.row = piece2.row;
    piece1.col = piece2.col;
    piece2.row = tempRow;
    piece2.col = tempCol;

    animateSwap(piece1, piece2);
}

// 动画交换
function animateSwap(piece1, piece2) {
    const pos1 = piece1.position.clone();
    const pos2 = piece2.position.clone();

    new TWEEN.Tween(piece1.position)
        .to({ x: pos2.x, y: pos2.y, z: pos2.z }, 200)
        .start();

    new TWEEN.Tween(piece2.position)
        .to({ x: pos1.x, y: pos1.y, z: pos1.z }, 200)
        .start();
}

// 检查匹配
function checkMatches() {
    // 这里可以添加匹配检测逻辑
}

// 相机位置
camera.position.set(0, 20, 20);
camera.lookAt(0, 0, 0);

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);
}

// 事件监听
window.addEventListener('click', onMouseClick);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

createGrid();
animate(); 