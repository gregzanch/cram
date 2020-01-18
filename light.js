let canvas = document.getElementById("webgl");
canvas.width = window.innerHeight;
canvas.height = window.innerHeight;
let gl = WebGLUtils.setupWebGL(canvas);

let vertexShaderSource = `
    attribute vec3 a_Position;
    attribute vec4 a_TexCoord;
    attribute vec3 a_Normal;
    attribute vec4 a_Color;

    uniform mat4 u_ModelViewMatrix;
    uniform mat3 u_NormalMatrix;
    uniform mat4 u_ProjectionMatrix;
    uniform mat4 u_ModelViewProjectionMatrix;
    uniform mat4 u_ModelViewMatrixInverse;
    uniform mat4 u_ProjectionMatrixInverse;
    uniform mat4 u_ModelViewProjectionMatrixInverse;

    struct LightInfo {
      vec4 position;
      vec3 ambient;
      vec3 diffuse;
      vec3 specular;
    };
    uniform LightInfo u_Light;

    struct MaterialInfo {
      vec3 ambient;
      vec3 diffuse;
      vec3 specular;
      float shine;
    };
    uniform MaterialInfo u_Material;

    varying vec3 v_LightIntensity;

    vec3 phong(vec4 p, vec3 n) {
      vec3 s = normalize(vec3(u_Light.position - p));
      vec3 v = normalize(-p.xyz);
      vec3 r = reflect(-s, n);

      vec3 ambient = u_Light.ambient * u_Material.ambient;
      float sDotN = max(dot(s, n), 0.0);
      vec3 diffuse = u_Light.diffuse * u_Material.diffuse * sDotN;
      vec3 spec = vec3(0.0);

      if (sDotN > 0.0) {
        spec = u_Light.specular * u_Material.specular * pow(max(dot(r, v), 0.0), u_Material.shine);
      }

      return ambient + diffuse + spec;
    }

    void main() {
      // Calculate the point we are shading and it's normal.
      vec4 p = u_ModelViewMatrix * vec4(a_Position, 1.0);
      vec3 n = normalize(u_NormalMatrix * a_Normal);

      // Calculate lighting via the Phong reflection model.
      v_LightIntensity = phong(p, n);

      // Output the final position.
      gl_Position = u_ModelViewProjectionMatrix * vec4(a_Position, 1.0);
    }
  `;

let fragmentShaderSource = `
    #ifdef GL_ES
      precision mediump float;
    #endif

    varying vec3 v_LightIntensity;

    void main() {
      gl_FragColor = vec4(v_LightIntensity, 1.0);
    }
  `;

// Setup light.
let lightPosition = [2.0, 2.0, 0.0, 1.0];
let lightAmbient = [0.3, 0.3, 0.3];
let lightDiffuse = [1.0, 1.0, 1.0];
let lightSpecular = [1.0, 1.0, 1.0];
let light = new Light(lightPosition, lightAmbient, lightDiffuse, lightSpecular);

// Setup camera.
let eye = [0.0, 0.0, 5.0];
let center = [0.0, 0.0, 0.0];
let up = [0.0, 1.0, 0.0];
let fov = Math.PI / 3;
let aspect = 1.0;
let near = 0.1;
let far = 100.0;
let camera = new Camera(eye, center, up, fov, aspect, near, far);

// Setup sphere with material.
let materialAmbient = [0.9, 0.5, 0.3];
let materialDiffuse = [0.9, 0.5, 0.3];
let materialSpecular = [0.8, 0.8, 0.8];
let materialShine = 100.0;
let sphereMaterial = new Material(
	materialAmbient,
	materialDiffuse,
	materialSpecular,
	materialShine
);
let sphere = new Sphere(gl, 2, 250, 250, sphereMaterial);

// Setup shader.
let shader = new Shader(
	gl,
	vertexShaderSource,
	fragmentShaderSource,
	light,
	camera,
	sphere
);

// Set up clear color and enable depth testing.
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

// Draw.
shader.draw(gl, sphere);
