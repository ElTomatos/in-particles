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
	BufferAttribute,
	BoxGeometry,
	Raycaster,
	Clock,
} from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap, { TimelineMax, TweenMax } from "gsap/all";
import { randomFloat } from "./utils/randomNum";

import particlesSvg from "../svg/faq-bg.svg";
import circle from "../svg/circle.png";

var PARTICLE_SIZE = 2;

var raycaster, intersects;
var mouse,
	INTERSECTED = [];
var camera;
var clock;

export const initScene = () => {
	const container = document.getElementById('wrapper');

	const scene = new Scene();
	camera = new PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);

	camera.position.set(0, 0, 100);
	camera.lookAt(0, 0, 0);
	const renderer = new WebGLRenderer({alpha: true});
	const loader = new SVGLoader();

	renderer.setClearColor(0x000000, 0);

	renderer.setSize(window.innerWidth, window.innerHeight);
	container.appendChild(renderer.domElement);

	renderer.render(scene, camera);

	const controls = new OrbitControls(camera, renderer.domElement);

	const sprite = new TextureLoader().load(circle);

	// Intersections
	raycaster = new Raycaster();
	raycaster.params.Points.threshold = 10;
	// raycaster.params.Line.threshold = 10;
	clock = new Clock(true);

	mouse = new Vector2();

	// create the particle variables
	var point_count = 300;
	var lin_cfnt = 1;
	var log_cfnt = 0.02;
	var x_position, y_position, z_position;

	var spriteMap = new TextureLoader().load(circle);

	var particles = new Geometry();
	particles.vertices = new Array(6000);
	var vertices = particles.vertices;
	// var vertices = new BoxGeometry( 200, 200, 200, 32, 32, 32 ).vertices;

	var positions = new Float32Array(vertices.length * 3);
	var colors = new Float32Array(vertices.length * 3);
	var sizes = new Float32Array(vertices.length);

	var vertex;
	var color = new Color();

	var geometry = new BufferGeometry();

	geometry.setAttribute("position", new BufferAttribute(positions, 3));
	geometry.setAttribute("customColor", new BufferAttribute(colors, 3));
	geometry.setAttribute("size", new BufferAttribute(sizes, 1));

	var particles = new Geometry();

	var material = new ShaderMaterial({
		uniforms: {
			color: { value: new Color(0xffffff) },
			pointTexture: { value: new TextureLoader().load(circle) },
		},
		vertexShader: document.getElementById("vertexshader").textContent,
		fragmentShader: document.getElementById("fragmentshader").textContent,

		alphaTest: 0.5,
	});

	// var material = new PointsMaterial({
	// 	size: 5,
	// 	map: spriteMap,
	// 	depthTest: false,
	// 	transparent: true,
	// 	sizeAttenuation: false,
	// 	alphaTest: 0.5,
	// 	blending: NormalBlending,
	// 	color: "#00ff00",
	// });

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

	let counter = 0;
	var vertex;
	circles.forEach((radius) => {
		var numNodes = 100;
		var nodes = [],
			width = radius * 2,
			height = radius * 2,
			angle,
			x,
			y,
			i;
		for (i = 0; i < numNodes; i++) {
			counter++;
			angle = (i / (numNodes / 2)) * Math.PI; // Calculate the angle at which the element will be placed.
			// For a semicircle, we would use (i / numNodes) * Math.PI.
			x = radius * Math.cos(angle) + width / 2 - radius; // Calculate the x position of the element.
			y = radius * Math.sin(angle) + width / 2 - radius; // Calculate the y position of the element.
			const particle = new Vector3(x, y, 0);

			vertex = particle;

			vertex.toArray(positions, counter * 3);

			vertices[counter] = vertex;

			if (i < numNodes / 4 || i > numNodes / 1.35) {
				color.setRGB((i + 100) / 100, 0, (i + 100) / 100);
			} else if (i < numNodes / 3) {
				color.setRGB((i + 50) / 100, 0, (i + 100) / 100);
			} else if (i < numNodes / 2) {
				color.setRGB((100 - i) / 100, 0, (i + 100) / 100);
			} else if (i < numNodes) {
				color.setRGB(i / 100, 0, (i + 100) / 100);
			}

			color.toArray(colors, counter * 3);

			if (counter > 3000) {
				sizes[counter] = PARTICLE_SIZE * 1.3;
			} else {
				sizes[counter] = PARTICLE_SIZE;
			}
		}
	});

	// console.log(particles);

	// create the particle system
	var particleSystem = new Points(geometry, material);

	// add it to the scene
	scene.add(particleSystem);

	function animate(ts) {
		requestAnimationFrame(animate);

		var geometry = particleSystem.geometry;
		var attributes = geometry.attributes;

		// required if controls.enableDamping or controls.autoRotate are set to true
		controls.update();

		raycaster.setFromCamera(mouse, camera);

		intersects = raycaster.intersectObject(particleSystem);

		const delta = clock.getDelta();

		if (intersects.length && intersects.length < 4100) {
			for (let intersect in intersects) {
				const object = intersects[intersect].object;
				const index = intersects[intersect].index;

				if (!INTERSECTED.find((obj) => obj.index === index)) {
					const initialX = attributes.position.array[index * 3];
					const initialY = attributes.position.array[index * 3 + 1];
					const config = {
						index,
						initialX,
						initialY,
						animating: delta,
						toX: initialX + randomFloat(-1, 1),
						toY: initialY + randomFloat(-1, 1),
					};

					INTERSECTED.push(config);
					attributes.position.array[index * 3] += config.toX * delta;
					attributes.position.array[index * 3 + 1] +=
						config.toY * delta;
				}
			}
		}

		for (let intersect in INTERSECTED) {
			const item = INTERSECTED[intersect];
			const currentX = attributes.position.array[item.index * 3];
			const currentY = attributes.position.array[item.index * 3 + 1];
			const animating = item.animating;

			// if (intersect == 0) {
			// 	console.log(currentX, currentY, item.initialX, item.initialY);
			// }

			if (item.animating < 1) {
				item.animating += delta;
				attributes.position.array[item.index * 3] += item.toX * delta;
				attributes.position.array[item.index * 3 + 1] +=
					item.toY * delta;
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

		// console.log(intersects);
		// if (intersects.length > 0) {
		// 	intersects.forEach((intersect, index) => {
		// 				if (!INTERSECTED.includes(index)) {
		// 				INTERSECTED.push(index);
		// 				console.log(INTERSECTED, attributes.size.array[index]);
		// 				attributes.size.array[index] = PARTICLE_SIZE * 1.25;
		// 				attributes.size.needsUpdate = true;
		// 			}

		// 	});
		// }

		for (var i = 0; i < intersects.length; i++) {
			/*
	            An intersection has the following properties :
	                - object : intersected object (THREE.Mesh)
	                - distance : distance from camera to intersection (number)
	                - face : intersected face (THREE.Face3)
	                - faceIndex : intersected face index (number)
	                - point : intersection point (THREE.Vector3)
	                - uv : intersection point in the object's UV coordinates (THREE.Vector2)
	        */
		}

		// if (intersects.length > 0) {
		// 	if (INTERSECTED != intersects[0].index) {
		// 		attributes.size.array[INTERSECTED] = PARTICLE_SIZE;

		// 		INTERSECTED = intersects[0].index;

		// 		attributes.size.array[INTERSECTED] = PARTICLE_SIZE * 1.25;
		// 		attributes.size.needsUpdate = true;
		// 	}
		// } else if (INTERSECTED !== null) {
		// 	attributes.size.array[INTERSECTED] = PARTICLE_SIZE;
		// 	attributes.size.needsUpdate = true;
		// 	INTERSECTED = null;
		// }

		renderer.render(scene, camera);
	}

	animate();
};

document.addEventListener("mousemove", function (e) {
	e.preventDefault();

	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
