import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Cursor
 * Detect mouse position by listening to mousemove event
 */
 const cursor = {
    x: 0,
    y: 0,
 }
window.addEventListener('mousemove', (event) => {
    // set cursor to have position from -0.5 to 0.5 on either x or y axis
    // this way we can set camera position relative to threejs position's
    // unit of measurement
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = - (event.clientY / sizes.height - 0.5)
    //console.log('clientX', event.clientX, 'clientY', event.clientY)
    //console.log(cursor)
})

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Scene
const scene = new THREE.Scene()

// Object
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
)
scene.add(mesh)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100)

// Sample orthograpic camera
/*const aspectRatio = sizes.width / sizes.height
const camera = new THREE.OrthographicCamera(
    -1 * aspectRatio,
    1 * aspectRatio,
    1,
    -1,
    1,
    100
)*/

//camera.position.x = 2
//camera.position.y = 2
camera.position.z = 2
camera.lookAt(mesh.position)
scene.add(camera)

//console.log(camera.position.length())

// OrbitControls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
//controls.target.y = 1
//controls.update()

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    //mesh.rotation.y = elapsedTime;

    // Update camera
    // cursor position multiplied by desired amount of amplitude
    // so we can see most of the sides of the cube except for its back
    //camera.position.x = cursor.x * 10
    //camera.position.y = cursor.y * 10
    //camera.lookAt(mesh.position)

    // make the camera rotate around the cube object by updating
    // camera's x and z axis using sin() and cos() given the angle
    // of cursor.x multiplied by pi times two then finally multiplied
    // again by 3 which is our desired amplitude
    // this results in our cube rotating only one revolution if we move our
    // mouse from left to right
    /*camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 3
    camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 3
    camera.position.y = cursor.y * 5
    camera.lookAt(mesh.position)*/

    // Update controls
    // reason why update is in tick function is that damping needs to be updated at each frame
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()