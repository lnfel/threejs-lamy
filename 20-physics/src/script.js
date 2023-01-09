import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
/**
 * Bruno used the old and unmaintained canon.js
 * in his video, I preferred to use the new maintained
 * package cannon-es.
 * 
 * https://github.com/pmndrs/cannon-es
 */
import * as CANNON from 'cannon-es'
console.log(CANNON)

/**
 * 3D Physics Library
 * Ammo.js
 * Cannon.js
 * Oimo.js
 * 
 * 2D Physics Library
 * Matter.js
 * P2.js
 * Planck.js
 * Box2D.js
 * 
 * Physijs
 */

/**
 * applyForce force originating from external sources that may affect rigidBody
 * applyImpuls similar to applyForce but will translate to velocity when hitting rigidBody
 * applyLocalForce force originating inside a target rigidBody (0,0,0 would be the center of the Body)
 * applyLocalImpulse same as applyImpuls but originates from the Body
 */

/**
 * (Default) NaiveBroadPhase tests every Bodies against every other Bodies
 * GridBroadPhase quadrilles the world and only tests other Bodies against other Bodies in the same grid box or the neighbor's grid boxes
 * (Recommended) SAPBroadPhase (Sweep And Prune) tests Bodies arbitrary axes during multiple steps
 */

/**
 * Constraints
 * HingeConstraint: acts like a door hinge.
 * DistanceConstraint: forces the bodies to keep a distance between each other.
 * LockConstraint: merges the bodies like if they were one piece.
 * PointToPointConstraint: glues the bodies to a specific point.
 */

/**
 * Challenge:
 * - [] Play slightly different hit sounds randomly
 * - [] Add a very short delay where the sounds cannot play again
 * after being played once
 * - [x] In addition to random volume, scale it according to impact strength
 * 
 * found some copy https://coursehunters.online/t/threejs-journey-part-5/4413
 */

/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {}
debugObject.createSphere = () => {
    createSphere(
        Math.random() * 0.5,
        { 
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }
    )
}
debugObject.createBox = () => {
    createBox(
        Math.random(),
        Math.random(),
        Math.random(),
        { 
            x: (Math.random() - 0.5) * 3,
            y: 3,
            z: (Math.random() - 0.5) * 3
        }
    )
}
debugObject.reset = () => {
    objectsToUpdate.forEach((object) => {
        // remove body
        object.body.removeEventListener('collide', playHitSound)
        world.removeBody(object.body)

        // remove mesh
        scene.remove(object.mesh)
    })
}
gui.add(debugObject, 'createSphere')
gui.add(debugObject, 'createBox')
gui.add(debugObject, 'reset')

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    '/textures/environmentMaps/0/px.png',
    '/textures/environmentMaps/0/nx.png',
    '/textures/environmentMaps/0/py.png',
    '/textures/environmentMaps/0/ny.png',
    '/textures/environmentMaps/0/pz.png',
    '/textures/environmentMaps/0/nz.png'
])

/**
 * Physics
 */
const world = new CANNON.World()
// Optimize performance by using SAPBroadphase for testing Bodies
world.broadphase = new CANNON.SAPBroadphase(world)
// allows skipping test for Bodies that are not in motion
// there is also sleepSpeedLimit and sleepTimeLimit but won't use it for now
world.allowSleep = true
// add gravity (9.82 is the gravity constant on Earth)
world.gravity.set(0, -9.82, 0)

/**
 * Material
 */
// const concreteMaterial = new CANNON.Material('concrete')
// const plasticMaterial = new CANNON.Material('plastic')
const defaultMaterial = new CANNON.Material('default')

/**
 * ContactMaterial is a combination of two Materials and how they should collide
 * @param {CANNON.Material} m1 first material
 * @param {CANNON.Material} m2 second material
 * @param {Object} options collision properties like friction (how much does it rub) and restitution (how much doe sit bounce) default value is 0.3
 * 
 * https://pmndrs.github.io/cannon-es/docs/classes/ContactMaterial.html
 */
// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
//     concreteMaterial,
//     plasticMaterial,
//     {
//         friction: 0.1,
//         restitution: 0.7
//     }
// )
// world.addContactMaterial(concretePlasticContactMaterial)

const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
        friction: 0.1,
        restitution: 0.7
    }
)
world.addContactMaterial(defaultContactMaterial)
// applies defaultContactMaterial to all body in physics world
world.defaultContactMaterial = defaultContactMaterial

/**
 * Sphere
 * use the same radius as our threejs sphere which is 0.5
 */
const sphereShape = new CANNON.Sphere(0.5)
const sphereBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape: sphereShape,
    // material: plasticMaterial
    // material: defaultMaterial
})
// push the sphere
// sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
// world.addBody(sphereBody)

/**
 * Floor
 */
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
floorBody.mass = 0
floorBody.addShape(floorShape)
// floorBody.material = concreteMaterial
// floorBody.material = defaultMaterial
world.addBody(floorBody)
/**
 * same with threejs plane initializes vertically so we need to rotate it as well
 * cannon js only supports quaternion
 * @param {CANNON.Vec3} vector the axis origin where we want to shift the body
 * @param {Number} angle the degree on how much we rotate the body from its axis
 */
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)

/**
 * Test sphere
 */
const sphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 32, 32),
    new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture
    })
)
sphere.castShadow = true
sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#777777',
        metalness: 0.3,
        roughness: 0.4,
        envMap: environmentMapTexture
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
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
camera.position.set(- 3, 3, 3)
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
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Utils
 * Handling multiple objects
 */

const objectsToUpdate = []

/**
 * Reusable sphere
 */
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20)
const sphereMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
})

/**
 * Create a random sphere object
 * 
 * @param {Number} radius 
 * @param {Object|THREE.Vector3|CANNON.Vec3} position object containing x, y and z properties
 * 
 * @return {undefined}
 */
const createSphere = (radius, position) => {
    // Three.js Mesh
    const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
    mesh.castShadow = true
    mesh.scale.set(radius, radius, radius)
    mesh.position.copy(position)
    scene.add(mesh)

    // CANNON.js Body
    const shape = new CANNON.Sphere(radius)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial
    })
    body.addEventListener('collide', playHitSound)
    body.position.copy(position)
    world.addBody(body)

    // save created object to update list
    objectsToUpdate.push({ mesh, body })
}

// createSphere(0.5, { x: 0, y: 3, z: 0 })
// console.log(objectsToUpdate)

/**
 * Reusable box
 */
const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
const boxMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.3,
    roughness: 0.4,
    envMap: environmentMapTexture
})

/**
 * Create a random box shape
 * 
 * @param {Number} width 
 * @param {Number} height 
 * @param {Number} depth 
 * @param {Object|THREE.Vector3|CANNON.Vec3} position object containing x, y and z properties
 * 
 * @return {undefined}
 */
const createBox = (width, height, depth, position) => {
    // Three.js mesh
    const mesh = new THREE.Mesh(boxGeometry, boxMaterial)
    mesh.castShadow = true
    mesh.scale.set(width, height, depth)
    mesh.position.copy(position)
    scene.add(mesh)

    // CANNON.js body
    /**
     * CANNON.Box is generated from the center of 
     * the object hence it only accepts halfExtents
     * we need to multiply the values by 0.5 to match
     * the THREE.BoxBufferGeometry shape
     */
    const halfExtents = new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5)
    const shape = new CANNON.Box(halfExtents)

    const body = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(0, 3, 0),
        shape,
        material: defaultMaterial
    })
    body.addEventListener('collide', playHitSound)
    body.position.copy(position)
    world.addBody(body)

    // save created object to update list
    objectsToUpdate.push({ mesh, body })
}

/**
 * Sound
 */

const hitSound = new Audio('/sounds/hit.mp3')

/**
 * Play sound when Bodies collide
 * 
 * @callback collideCallback
 * @param {Event} collision collide event
 * @return {undefined}
 */
const playHitSound = (collision) => {
    // console.log(collision)
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()
    const impactStrengthRounded = Math.floor(impactStrength)
    // console.log(impactStrength)
    // only play sfx with high impact collision to prevent multiple instances of sound being played
    if (impactStrength > 2) {
        // simulate various volume level on collision
        // fools the listener but it's okay
        // hitSound.volume = Math.random()

        // challenge: Add a very short delay where the sounds cannot play again after being played once
        // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDelay

        // challenge: scale sound according to impact strength
        // Normalize volume between 0 and 1
        const volume = Math.min(Math.max(impactStrengthRounded / 10, 0), 1)
        hitSound.volume = volume
        console.log(volume)

        // ensure play the sfx at the beginning when a collision happens
        hitSound.currentTime = 0
        hitSound.play()
    }
}

/**
 * Throttle utility
 * 
 * https://stackoverflow.com/a/27078401/12478479
 * https://jsfiddle.net/jonathansampson/m7G64/
 * 
 * @param {collideCallback} callback function to throttle
 * @param {Number} limit delay
 * @return {function: void}
 */
const throttle = (callback, limit) => {
    let wait = false

    return () => {
        if (!wait) {
            callback()
            wait = true

            setTimeout(() => {
                wait = false
            }, limit);
        }
    }
}

/**
 * Animate
 */
const clock = new THREE.Clock()
let oldElapsedTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    // how much seconds spent since the last tick
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime
    // console.log(deltaTime)

    /**
     * simulate wind to apply external force to our sphereBody
     * opposite of the inital force applied on the sphereBody locally
     */
    // sphereBody.applyForce(new CANNON.Vec3(-0.3, 0, 0), sphereBody.position)

    // Update physics world
    // https://gafferongames.com/post/fix_your_timestep/
    /**
     * @param {Number} dy A fixed time step
     * @param {Number} timeSinceLastCalled How much time passed since last step
     * @param {Number} maxSubSteps How much iterations the world can apply to catch up with potential delay
     * 
     * if we want 60fps we will use 1/60 on time step
     */
    world.step(1 / 60, deltaTime, 3)
    // sphere.position.x = sphereBody.position.x
    // sphere.position.y = sphereBody.position.y
    // sphere.position.z = sphereBody.position.z
    sphere.position.copy(sphereBody.position)
    // without a floor the sphere will keep on falling into the void
    // console.log(sphereBody.position.y)

    /**
     * Animating physics of multiple objects
     */
    objectsToUpdate.forEach((object) => {
        object.mesh.position.copy(object.body.position)
        // boxes should tumble and flip, for spheres they will rotate
        object.mesh.quaternion.copy(object.body.quaternion)
    })

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()