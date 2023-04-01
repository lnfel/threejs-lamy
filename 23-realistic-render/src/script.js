import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

/**
 * https://donmccurdy.com/2020/06/17/color-management-in-threejs
 * 
 * Continue at 00:40:51
 * 
 * All textures that we can see directly like map should have THREE.sRGBEncoding
 * and all other textures such as normalMap should have THREE.LinearEncoding
 */

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTexttureLoader = new THREE.CubeTextureLoader()

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Update all materials
 */
const updateAllMaterials = () => {
    scene.traverse((child) => {
        // console.log(child)
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // console.log(child)
            // child.material.envMap = environmentMap
            child.material.envMapIntensity = debugObject.envMapIntensity
            // When updating toneMapping we need to specify needsUpdate to our model
            // to update them as well
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

/**
 * Test sphere
 */
const testSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
)
// scene.add(testSphere)

/**
 * Environment Maps
 */
const environmentMap = cubeTexttureLoader.load([
    '/textures/environmentMaps/1/px.jpg',
    '/textures/environmentMaps/1/nx.jpg',
    '/textures/environmentMaps/1/py.jpg',
    '/textures/environmentMaps/1/ny.jpg',
    '/textures/environmentMaps/1/pz.jpg',
    '/textures/environmentMaps/1/nz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding
scene.background = environmentMap
scene.environment = environmentMap
debugObject.envMapIntensity = 5
gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials).name('EnvMap Intensity')

/**
 * Models
 */
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        console.log('FlightHelment loaded')
        // console.log(gltf)
        gltf.scene.scale.set(10, 10, 10)
        gltf.scene.position.set(0, -4, 0)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        gui.add(gltf.scene.rotation, 'y').min(- Math.PI).max(Math.PI).step(0.001).name('Helmet rotation Y')

        updateAllMaterials()
    }
)

gltfLoader.load(
    '/models/hamburger.glb',
    (gltf) => {
        gltf.scene.scale.set(0.3, 0.3, 0.3)
        gltf.scene.position.set(0, -1, -3)
        gltf.scene.rotation.y = Math.PI * 0.5
        scene.add(gltf.scene)

        gui.add(gltf.scene.rotation, 'y').min(- Math.PI).max(Math.PI).step(0.001).name('Helmet rotation Y')

        updateAllMaterials()
    }
)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(-5, 2.5, -0.5)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
// Prevent burger or model from casting shadow on itself
directionalLight.shadow.normalBias = 0.05
scene.add(directionalLight)

const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
scene.add(directionalLightCameraHelper)

gui.add(directionalLight, 'intensity').min(0).max(10).step(0.001).name('Light Intensity')
gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001).name('Light X')
gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001).name('Light Y')
gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001).name('Light Z')

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
camera.position.set(4, 1, -6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
/**
 * Tone mapping
 * THREE.NoToneMapping (Default)
 * THREE.LinearToneMapping
 * THREE.ReinhardToneMapping
 * THREE.CineonToneMapping
 * THREE.ACESFilmicToneMapping
 */
// console.log('THREE.ACESFilmicToneMapping: ', THREE.ACESFilmicToneMapping)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

gui.add(renderer, 'toneMapping', {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping
}).onFinishChange(() => {
    /**
     * THREE toneMapping are integer values
     * but when used in a select option it becomes string
     * that is why we need to hook onFinishChange event to transform the selected
     * value into an integer.
     */
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterials()
})
gui.add(renderer, 'toneMappingExposure').min(0).max(10).step(0.001)

/**
 * Animate
 */
const tick = () =>
{
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()