import './style.css'
import * as THREE from 'three'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Playing with position property
mesh.position.x = 0.7
mesh.position.y = - 0.6
mesh.position.z = 1

// Position of mesh relative to the center of the scene
console.log('Initial mesh vector length:', mesh.position.length())

// Reduce the vector length of mesh to value of 1
mesh.position.normalize()
console.log('Mesh vector length after normalize:', mesh.position.length())

/**
 * Set mesh vector3 coordinates
 * A shortcut for doing:
 * mesh.position.x = 0.7
 * mesh.position.y = - 0.6
 * mesh.position.z = 1
 */
mesh.position.set(0.7, - 0.6, 1)
console.log('Mesh position after using set method:', mesh.position.length())

/**
 * Playing with scale property
 * 
 * mesh.scale.x = 2
 * mesh.scale.y = 0.5
 * mesh.scale.z = 0.5
 */
mesh.scale.set(2, 0.5, 0.5)

/**
 * Playing with rotation
 * A good practice is to reorder first before doing rotation
 */
mesh.rotation.reorder('YXZ')
mesh.rotation.x = Math.PI * 0.25
mesh.rotation.y = Math.PI * 0.25

/**
 * Using group class
 * Imagine building a spaceship and that spaceship had a lot of parts
 * We can put all those parts in a group so we can transform the spaceship
 * and all of its parts at the same time
 * In the following code we are putting 3 cubes inside a group and
 * transform the group
 */
const group = new THREE.Group()
group.position.y = 1
group.scale.y = 2
group.rotation.y = 1
scene.add(group)

const cube1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)

const cube2 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
)
cube2.position.x = -2

const cube3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
)
cube3.position.x = 2

group.add(cube1)
group.add(cube2)
group.add(cube3)


// Axes helper shows a line representing the x, y and z axis
const axesHelper = new THREE.AxesHelper()
scene.add(axesHelper)

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
//camera.position.y = 1
//camera.position.x = 1
scene.add(camera)

/**
 * Make the camera look at the mesh object
 * lookAt method accepts a vector3 instance and
 * mesh.position is a vector instance
 */
camera.lookAt(mesh.position)
camera.lookAt(group.position)

// Distance between the mesh and the camera
console.log('Distance between the mesh and the camera', mesh.position.distanceTo(camera.position))

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)