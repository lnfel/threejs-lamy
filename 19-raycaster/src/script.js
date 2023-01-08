import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

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
 * Objects
 */
const object1 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object1.position.x = - 2

const object2 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)

const object3 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5, 16, 16),
    new THREE.MeshBasicMaterial({ color: '#ff0000' })
)
object3.position.x = 2

scene.add(object1, object2, object3)

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

// const rayOrigin = new THREE.Vector3(-3, 0, 0)
// const rayDirection = new THREE.Vector3(10, 0, 0)
/**
 * call normalize() on reyDirection because raycaster.set() needs a rayDirection
 * that has a length of 1
 */
// console.log(rayDirection.length())
// rayDirection.normalize()
// console.log(rayDirection.length())
// raycaster.set(rayOrigin, rayDirection)

// const intersect = raycaster.intersectObject(object2)
/**
 * the result is an array of object surface being hit
 * a ray can intersect multiple times
 */
// console.log(intersect)

// const intersects = raycaster.intersectObjects([object1, object2, object3])
// console.log(intersects)

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
 * Raycasting with Mouse hover
 */
const mouse = new THREE.Vector2()

// we can also listen for mousemove on the canvas in cases
// where canvas is smaller or larger than the window
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
    // console.log(mouse)
})

window.addEventListener('click', (event) => {
    if (currentIntersect) {
        switch (currentIntersect.object) {
            case object1:
                console.log('click on a sphere 1')
                break;

            case object2:
                console.log('click on a sphere 2')
                break;

            case object3:
                console.log('click on a sphere 3')
                break;
        }
    }
})

/**
 * Re-creating mouseenter and mouseleave event using THREEjs
 */
let currentIntersect = null

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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Animate objects
    object1.position.y = Math.sin(elapsedTime * 0.3) * 1.5
    object2.position.y = Math.sin(elapsedTime * 0.8) * 1.5
    object3.position.y = Math.sin(elapsedTime * 1.4) * 1.5

    // Cast a ray
    // const rayOrigin = new THREE.Vector3(-3, 0, 0)
    // const rayDirection = new THREE.Vector3(1, 0, 0)
    // rayDirection.normalize()

    // raycaster.set(rayOrigin, rayDirection)

    // // const intersect = raycaster.intersectObject(object2)
    // // console.log(intersect)

    // const objectsToTest = [object1, object2, object3]
    // const intersects = raycaster.intersectObjects(objectsToTest)
    // // console.log(intersects)

    // // make the objects color red
    // objectsToTest.forEach((object) => {
    //     object.material.color.set('#ff0000')
    // })

    // // change intersecting objects color to blue
    // intersects.forEach((intersect) => {
    //     // console.log(intersect.object)
    //     intersect.object.material.color.set('#0000ff')
    // })

    // another way to interpolate on array `for of` loop
    // for (const intersect of intersects) {
    //     intersect.object.material.color.set('#0000ff')
    // }

    /**
     * Raycaster Mouse hover test
     * raycaster shoots from camera origin to mouse coordinates
     */
    raycaster.setFromCamera(mouse, camera)
    const objectsToTest = [object1, object2, object3]
    const intersects = raycaster.intersectObjects(objectsToTest)

    objectsToTest.forEach((object) => {
        object.material.color.set('#ff0000')
    })

    intersects.forEach((intersect) => {
        intersect.object.material.color.set('#0000ff')
    })

    /**
     * Notify once when we enter an object
     * and when we leave the object
     */
    if (intersects.length) {
        if (!currentIntersect) {
            console.log('mouseenter')
        }

        currentIntersect = intersects[0]
    } else {
        if (currentIntersect) {
            console.log('mouseleave')
        }
        currentIntersect = null
    }


    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()