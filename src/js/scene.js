import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	LineBasicMaterial,
	Vector3,
	Vector2,
	BufferGeometry,
	Line,
	Group,
	MeshBasicMaterial,
	ShapeBufferGeometry,
	DoubleSide,
	Mesh,
	ParticleSystem,
	Geometry,
	RawShaderMaterial,
	ParticleBasicMaterial,
	Vertex,
	Points,
	PointsMaterial,
	TextureLoader,
	PointLight,
	SpriteCanvasMaterial,
	ShaderMaterial,
	Color,
	AdditiveBlending,
	BaseBlending,
	SpriteMaterial,
	NoBlending,
	SubtractiveBlending,
	MultiplyBlending,
	NormalBlending,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import particlesSvg from "../svg/faq-bg.svg";
import circle from "../svg/circle.png";

export const initScene = () => {
	const scene = new Scene();
	const camera = new PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.set(0, 0, 100);
	camera.lookAt(0, 0, 0);
	const renderer = new WebGLRenderer();
	const loader = new SVGLoader();

	renderer.setClearColor(0xff00ff, 1);

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	renderer.render(scene, camera);

	const controls = new OrbitControls(camera, renderer.domElement);

	const sprite = new TextureLoader().load(circle);

	console.log(sprite);

	function animate() {
		requestAnimationFrame(animate);

		// required if controls.enableDamping or controls.autoRotate are set to true
		controls.update();

		renderer.render(scene, camera);
	}

	animate();
	// create the particle variables
	var point_count = 300;
	var lin_cfnt = 1;
	var log_cfnt = 0.02;
	var x_position, y_position, z_position;

	var spriteMap = new TextureLoader().load(circle);

	var vertices = new BoxGeometry(200, 200, 200, 16, 16, 16).vertices;
	var positions = new Float32Array(vertices.length * 3);
	var colors = new Float32Array(vertices.length * 3);
	var sizes = new Float32Array(vertices.length);

	var vertex;
	var color = new THREE.Color();

	var particles = new Geometry();
	var material = new PointsMaterial({
		size: 5,
		map: spriteMap,
		depthTest: false,
		transparent: true,
		sizeAttenuation: false,
		alphaTest: 0.5,
		blending: NormalBlending,
		color: "#00ff00",
	});

	//    const light = new PointLight( 0xff0000, 1, 100 );
	// light.position.set( 0, 0, 0 );
	// scene.add( light );

	// for (var i = 0.1; i <= point_count; i = i + 0.1) {
	// 	x_position = lin_cfnt * Math.pow(Math.E, log_cfnt * i) * Math.cos(+i);
	// 	y_position = lin_cfnt * Math.pow(Math.E, log_cfnt * i) * Math.sin(+i);
	// 	z_position = 0;
	//     var particle = new Vector3(x_position, y_position, z_position)
	//     console.log(x_position, y_position);
	//   // add it to the geometry
	//   particles.vertices.push(particle);
	// }

	// N!
	//    var radius = 0;
	//    var angle = 0;
	// for (var n = 500; n > -500; n--) {
	//        radius += n * 0.000385;
	//        // make a complete circle every 50 iterations
	//        angle += (Math.PI * 2) / 50;

	//        var x =  radius * Math.cos(angle);
	//        var y = radius * Math.sin(angle);
	//        var particle = new Vector3(x, y, 0);
	//        particles.vertices.push(particle);

	//                console.log(radius);
	//    }

	// N2

	const circles = [];
	let radius = 0;

	for (let i = 20; i > 0; i--) {
		radius += i / 3;
		circles.push(radius);
	}

	circles.forEach((radius) => {
		var numNodes = 300;
		var nodes = [],
			width = radius * 2,
			height = radius * 2,
			angle,
			x,
			y,
			i;
		for (i = 0; i < numNodes; i++) {
			angle = (i / (numNodes / 2)) * Math.PI; // Calculate the angle at which the element will be placed.
			// For a semicircle, we would use (i / numNodes) * Math.PI.
			x = radius * Math.cos(angle) + width / 2 - radius; // Calculate the x position of the element.
			y = radius * Math.sin(angle) + width / 2 - radius; // Calculate the y position of the element.
			const particle = new Vector3(x, y, 0);
			particles.vertices.push(particle);
		}
	});

	// console.log(particles);

	// create the particle system
	var particleSystem = new Points(particles, material);

	// add it to the scene
	scene.add(particleSystem);

	camera.zoom = 4;
};
