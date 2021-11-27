import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const bakedShadow = textureLoader.load('/textures/bakedShadow.jpg')
const simpleShadow = textureLoader.load('/textures/simpleShadow.jpg')

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
//gui.width = 400

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
const ambientLightGUI = gui.addFolder('Ambient Light')
ambientLightGUI.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
directionalLight.position.set(2, 2, - 1)
directionalLight.castShadow = true

console.log(directionalLight.shadow)
console.log(directionalLight.shadow.camera)

directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
// optimizing shadow
directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 6
// reducing amplitude enhances the shadow
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = -2
directionalLight.shadow.camera.left = -2
// shadow blur
directionalLight.shadow.radius = 10

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
directionalLightCameraHelper.visible = false
scene.add(directionalLightCameraHelper)

const directionalLightGUI = gui.addFolder('Directional Light')
directionalLightGUI.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
directionalLightGUI.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
directionalLightGUI.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
directionalLightGUI.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
directionalLightGUI.add(directionalLightCameraHelper, 'visible').name('Camera helper')
scene.add(directionalLight)

// Spot Light
const spotLight = new THREE.SpotLight(0xffffff, 0.3, 10, Math.PI * 0.3)
spotLight.castShadow = true
spotLight.position.set(0, 1, 3)
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
// optimizing shadow
spotLight.shadow.camera.near = 1
spotLight.shadow.camera.far = 6
spotLight.shadow.camera.fov = 30

const spotLightGUI = gui.addFolder('Spot Light')
spotLightGUI.add(spotLight, 'intensity').min(0).max(1).step(0.001)
spotLightGUI.add(spotLight.position, 'x').min(- 5).max(5).step(0.001)
spotLightGUI.add(spotLight.position, 'y').min(- 5).max(5).step(0.001)
spotLightGUI.add(spotLight.position, 'z').min(- 5).max(5).step(0.001)
spotLightGUI.add(spotLight.shadow.camera, 'fov').min(10).max(45).step(0.001).name('Field of view')
scene.add(spotLight)
scene.add(spotLight.target)

const spotLightCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightCameraHelper.visible = false
scene.add(spotLightCameraHelper)
spotLightGUI.add(spotLightCameraHelper, 'visible').name('Camera helper')

// Point Light
const pointLight = new THREE.PointLight(0xffffff, 0.3)
pointLight.castShadow = true
pointLight.position.set(-1, 1, 0)
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.near = 0.1
pointLight.shadow.far = 3

const pointLightGUI = gui.addFolder('Point Light')
pointLightGUI.add(pointLight.position, 'x').min(- 5).max(5).step(0.001)
pointLightGUI.add(pointLight.position, 'y').min(- 5).max(5).step(0.001)
pointLightGUI.add(pointLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(pointLight)

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera)
pointLightCameraHelper.visible = false
scene.add(pointLightCameraHelper)
pointLightGUI.add(pointLightCameraHelper, 'visible').name('Camera helper')

/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 32, 32),
    material
)

sphere.castShadow = true

const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(5, 5),
    material
)

// using baked shadow (static shadow)
/*const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(5, 5),
    new THREE.MeshBasicMaterial({
        map: bakedShadow
    })
)*/

plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

plane.receiveShadow = true

scene.add(sphere, plane)

// Dynamic baked shadow
const sphereShadow = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(1.5, 1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        alphaMap: simpleShadow
    })
)

sphereShadow.rotation.x = - Math.PI * 0.5
sphereShadow.position.y = plane.position.y + 0.01

scene.add(sphereShadow)
gui.add(sphereShadow, 'visible').name('Simple shadow')

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
camera.position.x = 1
camera.position.y = 1
camera.position.z = 4
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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Enable shadow map
// This allows all object and light to cast or receive shadow
renderer.shadowMap.enabled = true
gui.add(renderer.shadowMap, 'enabled').name('Realtime shadow')
// Default shadowMap is PCFShadowMap
// PCFSoftShadowMap can enhance shadow but is less performant,
// it also does not support shadow radius (blur)
renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Animate
 */
const clock = new THREE.Clock()

/**
 * Bounce animation
 * https://medium.com/geekculture/learning-three-js-1-how-to-create-a-bouncing-ball-5f423a629e59
 */
let options = {
    acceleration: 5,
    bounceDistance: 2,
    bottomPosition: 0,
    step: 0.02
}

let timer = {
    step: 0.02,
    counter: Math.sqrt(options.bounceDistance * 2 / options.acceleration)
}

let initialSpeed = options.acceleration * timer.counter

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Update sphere: Bounce
    // https://medium.com/geekculture/learning-three-js-1-how-to-create-a-bouncing-ball-5f423a629e59
    /*if (sphere.position.y < options.bottomPosition) {
        timer.counter = 0
    }

    sphere.position.y = options.bottomPosition + initialSpeed * timer.counter - 0.5 * options.acceleration * timer.counter * timer.counter
    timer.counter += options.step*/

    // Threejs Journey Bounce with dynamic baked shadow
    // Update sphere
    sphere.position.x = Math.cos(elapsedTime) * 1.5
    sphere.position.z = Math.sin(elapsedTime) * 1.5
    sphere.position.y = Math.abs(Math.sin(elapsedTime * 3))
    // Update shadow
    sphereShadow.position.x = sphere.position.x
    sphereShadow.position.z = sphere.position.z
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.3

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()