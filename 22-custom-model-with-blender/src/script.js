import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'dat.gui'

/**
 * Blender Shortcuts
 *   - Orbit Rotate = Rotate Camera
 *   - Truck and Pedestal = Move camera horizontally and vertically
 *   - Dolly = Zoom in or out
 *   - Tilt and Pan = Rotate camera vertically and horizontally
 *     - Must be in Walk mode to to this (Shift + Back tick)
 *   - Local View = Focus on selected object and hide others
 * 
 * Keyboard:
 * Reset view = Shift + C
 * 
 * Mouse:
 * Orbit Rotate = Mouse wheel push + Mouse movement
 * Truck and Pedestal = Shift + Mouse wheel push + Mouse movement
 * Dolly = Mouse scroll up/forward or down/backward
 * Shift + Ctrl + Mouse wheel = Go beyond the limits of Dolly/Zoom in and out
 * 
 * Trackpad:
 * Orbit Rotate = 2 Finger + Mouse movement
 * Truck and Pedestal = Shift + 2 Finger + Mouse movement
 * Dolly = Pinch using 2 Finger to expand or compress
 * Dolly = Ctrl + 2 Finger up/forward or down/backward
 * 
 * Numpad:
 * Toggle perspective/ortographic view = numpad 5
 * Switch Axis view
 *   - X = numpad 3
 *   - Y = numpad 1
 *   - Z = numpad 7
 * Alternatively pressing Ctrl + Switch Axis numpad buttons
 * will go to reverse view of corresponding axis
 * Note: Z axis is at the top in Blender
 * 
 * Camera view = numpad 0
 * Note: The camera is needed when doing renders
 * 
 * Focus on selected object = numpad comma
 * Focus on selected object = View > Frame Selected
 * 
 * Local View = numpad / or /
 * 
 * Select multiple objects = Shift select object
 * Note: Active object is bright orange in color
 * Unselect active object = Shift select object again
 * Select all = A
 * Unselect all = Double A
 * Box like selection = B
 * Brush like selection = C |Note: Shift click to unselect
 * 
 * 3D viewport shortcuts
 * Object Mode shortcuts
 * Add Object = Shift + A
 * Remove object = X
 * Duplicate object = Shift + D
 * Bring up object properties = F9 or fn + F9
 * Hide object = Select object + H
 * Show hidden objects = Alt + H or Option + H
 * Hide unselected objects = Shift + H |Note: Similar to Local view without focusing on selected object
 * Toggle sidebar menu = T or Shift + spacebar to bring popup
 * Switch Mode Circular menu = Ctrl + Tab
 * Switch Between object and edit mode = Tab
 * 
 * Transforming objects
 * Position = G
 * Rotation = R or RR to rotate in all directions
 * Scale = S
 * 
 * Edit Mode shortcuts
 * Vertex select = 1
 * Edge select = 2
 * Face select = 3
 * Proportional Editing = O
 * 
 * Shading
 *   - Solid = Default with same material for every objects
 *   - Material = Like Solid shading but with preview for materials
 *   - Wireframe = Shows only wireframe boundaries
 *   - Renderer = Low quality render (realistic but less performant)
 * Shading Mode Circular menu = Z
 * 
 * Render = FN + F12
 * Search = FN + F3
 * 
 * Loop Cut = Ctrl + R
 */

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

gltfLoader.load(
    '/models/hamburger.glb',
    (gltf) =>
    {
        scene.add(gltf.scene)
    }
)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 8, 4, 8)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()