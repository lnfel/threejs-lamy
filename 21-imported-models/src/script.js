import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

/**
 * Maya
 * Blender
 * Cinema 4d
 * 3dsmax
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
const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
// Also copy the draco folder from `node_modules/three/examples/js/libs/draco`
// and paste it in `static` folder so we can access the draco files at `/draco`
dracoLoader.setDecoderPath('/draco/')

// enable gltf loader to use draco
// draco loader will only be used when needed
gltfLoader.setDRACOLoader(dracoLoader)

gltfLoader.load(
    // Default glTF
    // '/models/Duck/glTF/Duck.gltf',
    // (gltf) => {
    //     console.log('Duck: ', gltf)

    //     // scene.add(gltf.scene.children[0])
    // },
    // glTF-Binary
    // '/models/Duck/glTF-Binary/Duck.glb',
    // (gltf) => {
    //     console.log('Duck: ', gltf)

    //     scene.add(gltf.scene.children[0])
    // },
    // glTF-Draco // No DRACOLoader instance provided.
    '/models/Duck/glTF-Draco/Duck.gltf',
    (gltf) => {
        console.log('Duck: ', gltf)

        // scene.add(gltf.scene.children[0])
    },
    // glTF-Embedded
    // '/models/Duck/glTF-Embedded/Duck.gltf',
    // (gltf) => {
    //     console.log('Duck: ', gltf)

    //     scene.add(gltf.scene.children[0])
    // },
    // (progress) => {
    //     console.log('progress')
    //     console.log(progress)
    // },
    // (error) => {
    //     console.log('error')
    //     console.log(error)
    // }
)

/**
 * Flight helmet
 */
gltfLoader.load(
    '/models/FlightHelmet/glTF/FlightHelmet.gltf',
    (gltf) => {
        console.log('Flight Helmet: ', gltf)
        /**
         * loading children[0] will only load the first part of the model
         */
        // scene.add(gltf.scene.children[0])

        /**
         * Try adding each children
         * Still only adding some parts and other parts are not added.
         * The reason is that while looping, every children that has been added
         * is automatically removed from the gltf scene and for loop is messed up.
         */
        // for (const child of gltf.scene.children) {
        //     scene.add(child)
        // }

        /**
         * solution using while loop
         * as long as scene children array has something in it
         * load the first child until it is empty
         */
        // while (gltf.scene.children.length) {
        //     scene.add(gltf.scene.children[0])
        // }


        /**
         * another solution is to duplicate the children array
         * this array will not be handled by THREEjs and not automatically
         * remove children when using for loop
         */
        // const children = [...gltf.scene.children]
        // for (const child of children) {
        //     scene.add(child)
        // }

        /**
         * even more simpler solution is to just add the scene itself
         */
        // scene.add(gltf.scene)
    },
)

/**
 * Animated Fox
 */
let mixer = null

gltfLoader.load(
    '/models/Fox/glTF/Fox.gltf',
    (gltf) => {
        mixer = new THREE.AnimationMixer(gltf.scene)
        const actions = {
            survey: gltf.animations[0],
            walk: gltf.animations[1],
            run: gltf.animations[2],
        }
        const action = mixer.clipAction(actions['run'])
        console.log('fox action: ', action)

        // this won't work because we need to tell
        // animation mixer to update itself on each frame
        action.play()

        gltf.scene.scale.set(0.025, 0.025, 0.025)
        console.log('Fox: ', gltf)
        scene.add(gltf.scene)
    }
)

/**
 * Chisato
 */
gltfLoader.load(
    '/models/chisato-nishikigi/gltf/lycoris-recoil-nishikigi-chisato.gltf',
    (gltf) => {
        gltf.scene.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * -0.5)
        gltf.scene.traverse((node) => {
            if (node.isMesh) {
                // node.receiveShadow = true
                node.castShadow = true
            }
        })
        console.log('Chisato: ', gltf)

        // scene.add(gltf.scene)
    },
)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
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
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
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

    // Update animation mixer
    if (mixer !== null) {
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