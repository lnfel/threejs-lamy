import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', (event) => {
    // Update sizes on window resize
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    //console.log('Window has been resized!')

    // Update the camera aspect ratio as well
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer size as well
    renderer.setSize(sizes.width, sizes.height)

    // Set pixel ratio to be used, limit to 2 pixel ratio
    // pixel ratio is updated on resize to handle users that have dual monitors
    // with different device pixel ratio
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('dblclick', (event) => {
    // handle old safari using webkit prefix
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    //if (!document.fullscreenElement) {
    if (!fullscreenElement) {
        // go fullscreen if canvas.requestFullscreen or the webkit
        // counterpart feature exists
        if (canvas.requestFullscreen) {
            canvas.requestFullscreen()
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen()
        }
    } else {
        // exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
            document.webkitRequestFullscreen()
        }
    }
    //console.log('Double clicked!')
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()