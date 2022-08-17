import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// Post processing
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Constants
const ENTIRE_SCENE = 0, BLOOM_SCENE = 1

// Parameters
const parameters = {
    exposure: 1,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0,
    scene: 'Scene with Glow'
}

// Bloom layer
const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * GLTF
 * 
 * Grave
 * https://sketchfab.com/3d-models/grave-b3de8d38f8444ec6b6170cb235e4594f
 * 
 * Haunted House
 * https://sketchfab.com/3d-models/haunted-house-c363402560a14535912508b72f2f6535
 * 
 * https://github.com/pmndrs/react-three-fiber/issues/245#issuecomment-554612085
 * https://github.com/pmndrs/react-three-fiber/issues/245#issuecomment-578438517
 */
const gltfLoader = new GLTFLoader();

gltfLoader.load('textures/haunted-house/haunted_house.gltf', function(gltf) {
    gltf.scene.scale.set(0.2, 0.2, 0.2)
    gltf.scene.position.set(0, 2.2, 0)
    gltf.scene.traverse( function( node ) {
        // make all nodes in gltf scene receive shadow
        if ( node.isMesh ) {
            node.receiveShadow = true
            // console.log(node);
        }

        // objects to enable casting shadow
        const objectWithShadows = [
            'Plane000_0',
            'Plane000_1',
            // 'Plane013_0',    // House group, bad idea, we just want some part of house to cat shadow
            'Plane000_3',       // Roof
            'Plane000_5',       // Wooden sign
            'Plane000_7',       // Wooden Door and chain
            'Plane',            // Tree
            'Plane001_0',       // Tree
            'Plane002_0',       // Tree
            'Plane005_0',       // Tree
            'Plane010_0',       // Tree
            'Plane012_0',       // Tree
            'Plane014_0',       // Tree
            'Plane015_0',       // Tree
            'Plane016_0',       // Tree
            'Plane017_0',       // Tree
            'Plane018_0',       // Tree
            'Plane019_0',       // Tree
            'Circle002_0',      // Lamp posts
            'Circle004_1',      // Barrels
            'Cylinder000_0',    // Fence
            'Cylinder001_0',    // Fence
            'Cylinder002_0',    // Shovel
            'Cylinder006_0',    // Shovel
            'Cylinder004_0',    // Shovel
            'Cylinder004_1',    // Shovel
            'Cylinder003_0',    // Crop
            'Cylinder003_1',    // Crop
            'Cylinder005_0',    // Crop
            'Cylinder005_1',    // Crop
            'BezierCurve_0',    // Cart part
            'BezierCurve_1',    // Cart part
            'Plane008_1',       // Grass
            'Plane008_1001',    // Grass
            'Plane008_1002',    // Grass
            'Plane008_1003',    // Grass
            'Plane008_1004',    // Grass
            'Plane003_0',       // Clouds
            'Plane006_0',       // Clouds
            'Plane007_0',       // Clouds
            'Plane011_0',       // Clouds
            //'Plane000_4',       // Windows
        ]

        if (objectWithShadows.some((name) => name == node.name)) {
            node.castShadow = true
            // console.log(node);
        }

        // Remove all mists
        if (node.name.includes('mist')) {
            node.visible = false
        }

        // TODO: find a way to make object glow
        // for now we use unrealbloompass
        // https://www.8thwall.com/playground/postprocessing-bloom
        // https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_unreal_bloom.html
        const glowingObjects = [
            'Plane000_4', // Windows
            'Circle001_3', // Lamps
        ]

        // Glowing windows
        if (glowingObjects.some((name) => name == node.name)) {
            // Learn this
            // https://threejs.org/examples/#webgl_postprocessing_unreal_bloom_selective
            // https://github.com/mrdoob/three.js/blob/master/examples/webgl_postprocessing_unreal_bloom_selective.html
        }
    })

    scene.add(gltf.scene)
}, undefined, function ( error ) {
    console.error( error )
})

gltfLoader.load('textures/grave/grave.gltf', function(gltf) {
    // reduce scale since model is to big for our scene
    gltf.scene.scale.set(0.3, 0.3, 0.3)
    // cast gltf shadow
    // https://stackoverflow.com/a/49869883
    gltf.scene.traverse( function( node ) {
        if ( node.isMesh ) { node.castShadow = true }
    })
    
    for (let i = 0; i < 20; i++) {
        const graveGLTFAngle = Math.random() * Math.PI * 2                          // Random angle
        const graveGLTFRadius = 3 + Math.random() * 2                               // Random radius
        const graveGLTFX = Math.sin(graveGLTFAngle) * graveGLTFRadius               // Get the x position using sinus
        const graveGLTFY = getRandomYAxis(- 0.3, - 0.1)                             // Random y position of a grave
        const graveGLTFZ = Math.cos(graveGLTFAngle) * graveGLTFRadius               // Get the z position using cosinus

        // create the grave mesh
        const graveGLTFScene = gltf.scene.clone(true)                               // so we can instantiate multiple copies of this geometry

        // Position
        graveGLTFScene.position.set(graveGLTFX, graveGLTFY, graveGLTFZ)

        // Ratation
        graveGLTFScene.rotation.z = (Math.random() - 0.5) * 0.4
        graveGLTFScene.rotation.y = (Math.random() - 0.5) * 0.4

        graveGLTFScene.castShadow = true
        scene.add(graveGLTFScene)
    }

    // for testing
    //gltf.scene.position.set(2, 2, 0)
    //scene.add( gltf.scene )
    //console.log(gltf)
}, undefined, function ( error ) {
    console.error( error )
})

// Fog
//const fog = new THREE.Fog('#ff0000', 2, 6)
const fog = new THREE.Fog('#262837', 1, 30)
scene.fog = fog

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const doorColorTexture = textureLoader.load('textures/door/color.jpg')
const doorAlphaTexture = textureLoader.load('textures/door/alpha.jpg')
const doorAmbientOcclusionTexture = textureLoader.load('textures/door/ambientOcclusion.jpg')
const doorHeightTexture = textureLoader.load('textures/door/height.jpg')
const doorNormalTexture = textureLoader.load('textures/door/normal.jpg')
const doorMetalnessTexture = textureLoader.load('textures/door/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('textures/door/roughness.jpg')

const brickColorTexture = textureLoader.load('textures/bricks/color.jpg')
const brickAmbientOcclusionTexture = textureLoader.load('textures/bricks/ambientOcclusion.jpg')
const brickNormalTexture = textureLoader.load('textures/bricks/normal.jpg')
const brickRoughnessTexture = textureLoader.load('textures/bricks/roughness.jpg')

const grassColorTexture = textureLoader.load('textures/grass/color.jpg')
const grassAmbientOcclusionTexture = textureLoader.load('textures/grass/ambientOcclusion.jpg')
const grassNormalTexture = textureLoader.load('textures/grass/normal.jpg')
const grassRoughnessTexture = textureLoader.load('textures/grass/roughness.jpg')

const graveColorTexture = textureLoader.load('textures/grave/color.jpeg')
const graveMetallicRoughnessTexture = textureLoader.load('textures/grave/metallic_roughness.png')
const graveNormalTexture = textureLoader.load('textures/grave/normal.png')

grassColorTexture.repeat.set(8, 8)
grassAmbientOcclusionTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping

/**
 * House
 */
const house = new THREE.Group()
//scene.add(house)

// Walls
const walls = new THREE.Mesh(
    new THREE.BoxBufferGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        //color: '#ac8e82',
        map: brickColorTexture,
        aoMap: brickAmbientOcclusionTexture,
        normalMap: brickNormalTexture,
        roughnessMap: brickRoughnessTexture,
    })
)
// required for ambient occlusion
walls.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
)
walls.position.y = 2.5 / 2
house.add(walls)

// Roof
const roof = new THREE.Mesh(
    new THREE.ConeBufferGeometry(3.5, 2, 4),
    new THREE.MeshStandardMaterial({ color: '#b35f45' })
)
roof.rotation.y = Math.PI * 0.25
roof.position.y = 3 + 0.5
house.add(roof)

// Door
const door = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2.2, 2.2, 100, 100),
    new THREE.MeshStandardMaterial({
        //color: '#aa7b7b'
        map: doorColorTexture,
        transparent: true,
        alphaMap: doorAlphaTexture,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture,
    })
)
// required for ambient occlusion
door.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2)
)
door.position.y = 1
door.position.z = 2 + 0.01
house.add(door)

// Bushes
const bushGeometry = new THREE.SphereBufferGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#89c854' })

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(- 0.8, 0.1, 2.2)

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(- 1, 0.05, 2.6)

house.add(bush1, bush2, bush3, bush4)

// Graves
const graves = new THREE.Group()
scene.add(graves)

const graveGeometry = new THREE.BoxBufferGeometry(0.6, 0.8, 0.2)
//const graveGeometry = new THREE.PlaneBufferGeometry(0.6, 0.8, 100, 100)
const graveMaterial = new THREE.MeshStandardMaterial({
    color: '#b2b6b1',
    // map: grassColorTexture,
    // transparent: true,
    // normalMap: graveNormalTexture,
    // metalnessMap: graveMetallicRoughnessTexture,
    // roughnessMap: graveMetallicRoughnessTexture,
})

function getRandomYAxis(min, max) {
    return Math.random() * (max - min) + min
}

for (let i = 0; i < 50; i++) {
        const angle = Math.random() * Math.PI * 2   // Random angle
        const radius = 3 + Math.random() * 6        // Random radius
        const x = Math.sin(angle) * radius          // Get the x position using sinus
        const y = getRandomYAxis(- 0.1, 0.3)        // Random y position of a grave
        const z = Math.cos(angle) * radius          // Get the z position using cosinus

        // create the grave mesh
        const grave = new THREE.Mesh(graveGeometry, graveMaterial)

        // Position
        grave.position.set(x, y, z)

        // Ratation
        grave.rotation.z = (Math.random() - 0.5) * 0.4
        grave.rotation.y = (Math.random() - 0.5) * 0.4

        grave.castShadow = true
        //graves.add(grave)
}

// Temporary sphere
/*const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial({ roughness: 0.7 })
)
sphere.position.y = 1
scene.add(sphere)*/

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        //color: '#a9c388',
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture,
    })
)
// required for ambient occlusion
floor.geometry.setAttribute(
    'uv2',
    new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
)
floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
//scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.3)// 0.12
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.5)// 0.12
// moonLight.position.set(7, 4, -5)
moonLight.position.set(7, 7, -1.5)
const moonLightTarget = new THREE.Object3D()
moonLightTarget.position.set(0,0,0)
moonLight.target = moonLightTarget
scene.add(moonLight)
scene.add(moonLightTarget)
scene.add(moonLight.target)

const moonLightHelper = new THREE.DirectionalLightHelper(moonLight, 0.2)
moonLightHelper.visible = false
scene.add(moonLightHelper)

// Door Light
const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
doorLight.position.set(0, 2.2, 2.7)
house.add(doorLight)

/**
 * Ghosts
 */
const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
// scene.add(ghost1, ghost2, ghost3)

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
camera.position.y = 3
camera.position.z = 6
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    // alpha: true,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837')

/**
 * RenderPass
 */
const renderScene = new RenderPass(scene, camera)

/**
 * BloomPass
 */
const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 )
bloomPass.threshold = parameters.bloomThreshold
bloomPass.strength = parameters.bloomStrength
bloomPass.radius = parameters.bloomRadius

/**
 * EffectComposer
 */
const composer = new EffectComposer(renderer)
// composer.renderToScreen = false
composer.addPass(renderScene)
composer.addPass(bloomPass)

/**
 * Shadows
 */
renderer.shadowMap.enabled = true
renderer.toneMapping = THREE.ACESFilmicToneMapping
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.shadowMap.type = true
renderer.toneMappingExposure = 1

moonLight.castShadow = true
doorLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

walls.castShadow = true
bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

floor.receiveShadow = true

/**
 * Optimizations
 * We can find the right values for this using light camera helper
 * But will follow on the guide for now
 */
doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

ghost1.shadow.mapSize.width = 256
ghost1.shadow.mapSize.height = 256
ghost1.shadow.camera.far = 7

ghost2.shadow.mapSize.width = 256
ghost2.shadow.mapSize.height = 256
ghost2.shadow.camera.far = 7

ghost3.shadow.mapSize.width = 256
ghost3.shadow.mapSize.height = 256
ghost3.shadow.camera.far = 7

/**
 * GUI
 */
// Fog
const fogGUI = gui.addFolder('Fog')
fogGUI.add(fog, 'far').min(0).max(100).step(10)
// Ambient Light
const ambientLightGUI = gui.addFolder('Ambient Light')
ambientLightGUI.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
// Moon Light
const directionalLightGUI = gui.addFolder('Directional Light')
// directionalLightGUI.addColor(moonLight, 'color')
directionalLightGUI.add(moonLight, 'intensity').min(0).max(1).step(0.001)
directionalLightGUI.add(moonLight.position, 'x').min(-10).max(10).step(0.001)
directionalLightGUI.add(moonLight.position, 'y').min(-10).max(20).step(0.001)
directionalLightGUI.add(moonLight.position, 'z').min(-10).max(10).step(0.001)
directionalLightGUI.add(moonLight, 'visible').name('Moon light')
directionalLightGUI.add(moonLightHelper, 'visible').name('Helper')
// Bloom
const bloomGUI = gui.addFolder('Bloom')
bloomGUI.add(parameters, 'exposure').min(0.1).max(2).onChange(function (value) {
    renderer.toneMappingExposure = Math.pow(value, 4.0)
})
bloomGUI.add(parameters, 'bloomThreshold').min(0.0).max(1).step(0.01).onChange(function (value) {
    bloomPass.threshold = Number(value)
})
bloomGUI.add(parameters, 'bloomStrength').min(0.0).max(3).onChange(function (value) {
    bloomPass.strength = Number(value)
})
bloomGUI.add(parameters, 'bloomRadius').min(0.0).max(1).step(0.01).onChange(function (value) {
    bloomPass.radius = Number(value)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Ghosts
    const ghost1Angle = elapsedTime * 0.5
    ghost1.position.x = Math.cos(ghost1Angle) * 4
    ghost1.position.z = Math.sin(ghost1Angle) * 4
    ghost1.position.y = Math.sin(elapsedTime * 3)

    const ghost2Angle = - elapsedTime * 0.32
    ghost2.position.x = Math.cos(ghost2Angle) * 5
    ghost2.position.z = Math.sin(ghost2Angle) * 5
    ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

    const ghost3Angle = - elapsedTime * 0.18
    ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
    ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
    ghost3.position.y = Math.sin(elapsedTime * 5) + Math.sin(elapsedTime * 2)

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    composer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()