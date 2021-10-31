// Scene
const scene = new THREE.Scene()

// Cube
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({
	color: 0xff0000,
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Camera
const sizes = {
	width: document.documentElement.clientWidth,
	height: document.documentElement.clientHeight,
}
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const canvas = document.querySelector('.webgl')
console.log(canvas)
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

console.log(document.documentElement.clientWidth)