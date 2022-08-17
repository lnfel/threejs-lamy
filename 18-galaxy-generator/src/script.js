import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { WebGLMultisampleRenderTarget } from 'three'

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
 * Test cube
 */
/*const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)
scene.add(cube)*/

/**
 * Galaxy
 */
const parameters = {}
parameters.count = 20000
parameters.size = 0.02
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.5
parameters.randomnessPower = 3
parameters.insideColor = '#ff6030'
parameters.outsideColor = '#1b3984'

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
    /**
     * Destroy old galaxy
     */
    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    /**
     * Geometry
     */
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    console.log(colorInside)

    // Base positions
    /*for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        positions[i3 + 0] = (Math.random() - 0.5) * 3
        positions[i3 + 1] = (Math.random() - 0.5) * 3
        positions[i3 + 2] = (Math.random() - 0.5) * 3
    }*/

    // Spiral
    for (let i = 0; i < parameters.count; i++) {
        const i3 = i * 3

        // Position
        const radius = Math.random() * parameters.radius
        const spinAngle = radius * parameters.spin
        // Example parameters.branches is equal to 3
        // Modulus 3 means (0,1,2, 0,1,2 and so on)
        // It won't reach 3 no matter what
        // Then divide the resulting value to branches again to have a value from 0 to 1
        // Ex. 0, 0.33, 0.66
        // Finally multiply the result by PI and 2 to get angle rotation
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        if (i < 20) {
            console.log(i, branchAngle)
        }

        // const randomX = Math.random() * parameters.randomness
        // const randomY = Math.random() * parameters.randomness
        // const randomZ = Math.random() * parameters.randomness

        // const randomX = (Math.random() - 0.5) * parameters.randomness
        // const randomY = (Math.random() - 0.5) * parameters.randomness
        // const randomZ = (Math.random() - 0.5) * parameters.randomness

        // const randomX = Math.pow(Math.random(), parameters.randomnessPower)
        // const randomY = Math.pow(Math.random(), parameters.randomnessPower)
        // const randomZ = Math.pow(Math.random(), parameters.randomnessPower)

        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        // const randomX = (Math.random() - 0.5) * parameters.randomness * radius
        // const randomY = (Math.random() - 0.5) * parameters.randomness * radius
        // const randomZ = (Math.random() - 0.5) * parameters.randomness * radius


        // Sample position of x axis in a single line
        //positions[i3 + 0] = radius

        positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX
        // positions[i3 + 1] = 0
        positions[i3 + 1] = randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color
        // clone the base color so we can use .lerp method to produce a mix color
        // without changing the base color
        const mixedColor = colorInside.clone()
        // .lerp( color : Color, alpha : Float ) : this
        // changing alpha to 0 means more base color
        // chaging alpha to 1 means more of the mixed color
        // changing alpha to 0.5 produces a mixed of the two
        // mixedColor.lerp(colorOutside, 0.5)
        
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        // colors[i3 + 0] = 1
        // colors[i3 + 1] = 0
        // colors[i3 + 2] = 0

        colors[i3 + 0] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    /**
     * Material
     */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        // color: '#ff5588'
    })

    /**
     * Points
     */
    points = new THREE.Points(geometry, material)
    scene.add(points)
}

generateGalaxy()

gui.add(parameters, 'count').min(100).max(500).step(50).onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

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
camera.position.x = 3
camera.position.y = 3
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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()