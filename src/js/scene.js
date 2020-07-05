/**
 * Vendors
 */
import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	Vector3,
	Vector2,
	BufferGeometry,
	Mesh,
	Geometry,
	Points,
	TextureLoader,
	ShaderMaterial,
	Color,
	BufferAttribute,
	Raycaster,
	Clock,
	TextGeometry,
	Font,
	MeshPhongMaterial,
	DirectionalLight,
} from "three";


/**
 * Utils
 */
import { randomFloat } from "./utils/randomNum";
import { removeLoader } from "./removeLoader";

/**
 * Particles texture
 */
import circle from "../svg/circle.png";

/**
 * Question mark texture
 */
import facetype from "../fonts/alegreya.json";

/**
 * Constants
 */
const CIRCLES_COUNT = 20;
const SMALL_CIRCLES = 6;
const SMALL_CIRCLES_PARTICLES = 40;
const BIG_CIRCLES_PARTICLES = 100;
const PARTICLES_COUNT = SMALL_CIRCLES * SMALL_CIRCLES_PARTICLES + (CIRCLES_COUNT - SMALL_CIRCLES) * BIG_CIRCLES_PARTICLES;
const PARTICLE_SIZE = 2;

/**
 * Global definitions
 */
let raycaster;
let intersects;
let mouse;
let INTERSECTED = [];
let camera;
let clock;

let ww = window.innerWidth;
let wh = window.innerHeight;

/**
 * Add question mark mesh
 */
const addQuestionMark = () => {
	const font = new Font(facetype);
	const geometry = new TextGeometry('?', {
		font: font,
		size: 80,
		height: 4,
		curveSegments: 0,
		bevelEnabled: true,
		bevelThickness: 2,
		bevelSize: 2,
		bevelOffset: 0,
		bevelSegments: 100
	});

	const textMaterial = new MeshPhongMaterial({ color: 0x856dff, opacity: 0.2 });

	const mesh = new Mesh(geometry, textMaterial);
	mesh.position.set(-20, -30, -25);

	return mesh;
};

/**
 * Add light to scene
 */
const addLight = () => {
	const light = new DirectionalLight(0x652eff, 1);
	light.position.set(0, 25, 30);
	light.target.position.set(0, -10, 0);
	return light;
};


/**
 * Mouse move handler
 * for particles intersections
 * and question mark rotation
 */
const addMouseMoveHandler = (mouse, questionMark) => {
	document.addEventListener("mousemove", function (e) {
		e.preventDefault();

		mouse.x = (e.clientX / ww) * 2 - 1;
		mouse.y = -(e.clientY / wh) * 2 + 1;

		questionMark.rotation.y = mouse.x * .2;
		questionMark.rotation.x = -mouse.y * .2;
	});
};

/**
 * Resize handler
 */
const addResizeHandler = (camera, renderer) => {
	window.addEventListener('resize', function() {
		ww = window.innerWidth;
		wh = window.innerHeight;

		camera.aspect = ww / wh;
		camera.updateProjectionMatrix();
	
		renderer.setSize( ww, wh );
	});
};

/**
 * Init camera
 */
const initCamera = () => {
	const camera = new PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	camera.position.set(0, 0, 100);
	camera.lookAt(0, 0, 0);

	return camera;
};

/**
 * Init whole scene
 */
export const initScene = () => {
	/** Scene */
	const scene = new Scene();

	/** Camera */
	camera = initCamera();

	/** Renderer */
	const renderer = new WebGLRenderer({ alpha: true });
	renderer.setClearColor(0x000000, 0);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render(scene, camera);

	/** Set renderer pixel ratio */
	const pixelRatio = window.devicePixelRatio || 1;
	renderer.setPixelRatio(pixelRatio);

	/** Append scene to DOM */
	const container = document.getElementById('wrapper');
	container.appendChild(renderer.domElement);

	/** Intersections Raycaster */
	raycaster = new Raycaster();
	raycaster.params.Points.threshold = 10;

	/** Clock */
	clock = new Clock(true);

	/** Mouse */
	mouse = new Vector2(5000,5000,0);

	/** Particles variables */
	const particles = new Geometry();
	particles.vertices = new Array(PARTICLES_COUNT);
	const vertices = particles.vertices;

	const positions = new Float32Array(vertices.length * 3);
	const colors = new Float32Array(vertices.length * 3);
	const sizes = new Float32Array(vertices.length);

	const color = new Color();

	const geometry = new BufferGeometry();

	/** Geometry attributes */
	geometry.setAttribute("position", new BufferAttribute(positions, 3));
	geometry.setAttribute("customColor", new BufferAttribute(colors, 3));
	geometry.setAttribute("size", new BufferAttribute(sizes, 1));

	/** Particles shader */
	const material = new ShaderMaterial({
		uniforms: {
			color: { value: new Color(0xffffff) },
			pointTexture: { value: new TextureLoader().load(circle) },
		},
		vertexShader: document.getElementById("vertexshader").textContent,
		fragmentShader: document.getElementById("fragmentshader").textContent,

		alphaTest: 0.5,
	});

	/** Create circles */
	const circles = [];
	let radius = 0;

	for (let i = CIRCLES_COUNT; i > 0; i--) {
		radius += i / 3;
		circles.push(radius);
	}

	/** Create particles for circles */
	let counter = 0;
	circles.forEach((radius, index) => {
		const numNodes = index > SMALL_CIRCLES ? BIG_CIRCLES_PARTICLES : SMALL_CIRCLES_PARTICLES;
		const width = radius * 2;
		let angle;
		let x;
		let y;
		let i;
		for (i = 0; i < numNodes; i++) {
			counter++;
			angle = (i / (numNodes / 2)) * Math.PI; // Calculate the angle at which the element will be placed.
			x = radius * Math.cos(angle) + width / 2 - radius; // Calculate the x position of the element.
			y = radius * Math.sin(angle) + width / 2 - radius; // Calculate the y position of the element.
			const particle = new Vector3(x, y, 0);

			particle.toArray(positions, counter * 3);

			/** Calculate particle color */
			if (i < numNodes / 4 || i > numNodes / 1.35) {
				color.setRGB((i + 100) / 100, 0, (i + 100) / 100);
			} else if (i < numNodes / 3) {
				color.setRGB((i + 50) / 100, 0, (i + 100) / 100);
			} else if (i < numNodes / 2) {
				color.setRGB((100 - i) / 100, 0, (i + 100) / 100);
			}

			color.toArray(colors, counter * 3);

			/** Calculate particles size */
			if (counter < 200) {
				sizes[counter] = PARTICLE_SIZE * 0.8;
			} else if (counter > 1000) {
				sizes[counter] = PARTICLE_SIZE * 1.3;
			} else {
				sizes[counter] = PARTICLE_SIZE;
			}
		}
	});

	/** Create particle system */
	const particleSystem = new Points(geometry, material);
	scene.add(particleSystem);

	/** Animation loop */
	function animate() {
		requestAnimationFrame(animate);

		const { geometry } = particleSystem;
		const { attributes}  = geometry;

		/** Get mouse intersections */
		raycaster.setFromCamera(mouse, camera);
		intersects = raycaster.intersectObject(particleSystem);

		/** Get delta from previous tick */
		const delta = clock.getDelta();

		/** Add intersections to animation */
		if (intersects.length && intersects.length < PARTICLES_COUNT) {
			for (let intersect in intersects) {
				const { index } = intersects[intersect];

				if (!INTERSECTED.find((obj) => obj.index === index)) {
					const initialX = attributes.position.array[index * 3];
					const initialY = attributes.position.array[index * 3 + 1];
					const config = {
						index,
						initialX,
						initialY,
						animating: delta,
						toX: initialX + 2,
						toY: initialY + 2,
					};

					INTERSECTED.push(config);
					attributes.position.array[index * 3] += config.toX * delta / 8;
					attributes.position.array[index * 3 + 1] +=
						config.toY * delta;
				}
			}
		}

		/** Animate intersections */
		for (let intersect in INTERSECTED) {
			const item = INTERSECTED[intersect];
			const currentX = attributes.position.array[item.index * 3];
			const currentY = attributes.position.array[item.index * 3 + 1];

			if (item.animating < 1) {
				item.animating += delta;
				attributes.position.array[item.index * 3] += item.toX * delta / 8;
				attributes.position.array[item.index * 3 + 1] +=
					item.toY * delta / 8;
			} else {
				if (item.initialX !== currentX || item.initialY !== currentY) {
					if (Math.abs(item.initialX - currentX) > 0.05) {
						attributes.position.array[item.index * 3] +=
							(item.initialX - currentX) * delta * 10;
					} else {
						attributes.position.array[item.index * 3] =
							item.initialX;
					}

					if (Math.abs(item.initialY - currentY) > 0.05) {
						attributes.position.array[item.index * 3 + 1] +=
							(item.initialY - currentY) * delta * 10;
					} else {
						attributes.position.array[item.index * 3 + 1] =
							item.initialY;
					}
				} else {
					INTERSECTED.splice(intersect, 1);
				}
			}
		}

		attributes.position.needsUpdate = true;

		renderer.render(scene, camera);
	}

	/** Add question mark */
	const questionMark = addQuestionMark();
	scene.add(questionMark);

	/** Add light */
	const light = addLight();
	scene.add(light);
	scene.add(light.target);

	/** Add mouse move handler */
	addMouseMoveHandler(mouse, questionMark);

	/** Add resize handler */
	addResizeHandler(camera, renderer);

	/** Start animation loop */
	animate();

	setTimeout(() => {
		removeLoader();
	}, 1000);
};


