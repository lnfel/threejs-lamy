import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import sampleTypefaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Axes Helper
const axesHelper = new THREE.AxesHelper()
//scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
let matcapTextures = [];
for (let i = 1; i <= 8; i++) {
    console.log(`/textures/matcaps/${i}.png`)
    matcapTextures.push(textureLoader.load(`/textures/matcaps/${i}.png`))
}
console.log(matcapTextures)
//const matcapTexture = textureLoader.load('/textures/matcaps/8.png')

/**
 * Fonts
 */
const fontLoader = new THREE.FontLoader()

// '/fonts/Evanescent_Regular.json',
// '/fonts/helvetiker_regular.typeface.json',
fontLoader.load(
    '/fonts/Evanescent_Regular.json',
    (font) => {
        console.log('font loaded')
        console.log(font)
        const textGeometry = new THREE.TextBufferGeometry(
            'BK2o1',
            {
                font: font,
                // font size
                size: 0.5,
                // the thickness of font on z axis
                height: 0.02,
                // curve detail, the higher the number the more triangles
                curveSegments: 20,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 3,
            }
        )

        textGeometry.computeBoundingBox()
        // boundingBox is null be default and so we need to call
        // computeBoundingBox() method to calculate and fill the property with right values
        console.log(textGeometry.boundingBox)

        // To center the text we will take the computed bounding box
        // and reduce the half of the values for x, y and z
        // The resulting position is not the exact center but close to it
        // This is because of the bevelThickness and bevelSize
        /*textGeometry.translate(
            - textGeometry.boundingBox.max.x * 0.5,
            - textGeometry.boundingBox.max.y * 0.5,
            - textGeometry.boundingBox.max.z * 0.5
        )*/

        // computing the bounding box again shows max.x and min.x are not equal
        /*textGeometry.computeBoundingBox()
        console.log(textGeometry.boundingBox)*/

        // To finally centering the object for real we do the following
        // Subtract bevelSize to x and y axis
        // Subtract bevelThickness to z axis
        // The additional parentheses makes the calculation follow
        // mathematics standard rule of calculation
        textGeometry.translate(
            - (textGeometry.boundingBox.max.x - 0.02) * 0.5,
            - (textGeometry.boundingBox.max.y - 0.02) * 0.5,
            - (textGeometry.boundingBox.max.z - 0.03) * 0.5 
        )

        // note that the computation that is used on textGeometry.translate
        // works on the tutorial font (Helvetiker) provided by threejs
        // but not on the custom font like Evanescent
        // this is not an issue when using the center() method tho
        textGeometry.computeBoundingBox()
        console.log(textGeometry.boundingBox)

        // threejs helpful method for centering geometry objects
        textGeometry.center()

        // note: we can reuse material for many meshes
        const material = new THREE.MeshMatcapMaterial({
            //wireframe: true,
        })
        material.matcap = matcapTextures[7]
        const text = new THREE.Mesh(textGeometry, material)
        scene.add(text)

        //gui.add(text.scale, 'x', -3, 3, 0.01)

        console.time('donuts')

        const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45)

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
        function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min) + min);
        }

        for (let i = 0; i < 100; i++) {
            // avoid initializing new geometry and meterial for each mesh object
            // instead initialize geometry and material once and take advantage of reusing it
            // for each mesh object we add on the scene
            //const donutGeometry = new THREE.TorusBufferGeometry(0.3, 0.2, 20, 45)
            let donutMaterial = new THREE.MeshMatcapMaterial
            //donutMaterial.matcap = matcapTexture

            var randomMatcap = getRandomInt(0, 7)
            console.log(randomMatcap)
            donutMaterial.matcap = matcapTextures[randomMatcap]
            const donut = new THREE.Mesh(donutGeometry, donutMaterial)

            donut.position.x = (Math.random() - 0.5) * 10
            donut.position.y = (Math.random() - 0.5) * 10
            donut.position.z = (Math.random() - 0.5) * 10

            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI

            // for randomizing scale use only one random value
            // and use it on x, y and z
            const scale = Math.random()
            donut.scale.set(scale, scale, scale)

            scene.add(donut)
        }

        console.timeEnd('donuts')
    }
)

/**
 * Object
 */
/*const cube = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
)

scene.add(cube)*/

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
camera.position.z = 2
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