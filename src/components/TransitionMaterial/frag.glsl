uniform vec2 uResolution;
uniform sampler2D uTextureA;
uniform sampler2D uTextureB;
uniform float uTransitionProgress;
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

mediump float;

float sdCircle(vec2 p, float r)
{
    return length(p) - r;
}

/*
 * Random number generator with a float seed
 *
 * Credits:
 * http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0
 */
highp float random1d(float dt) {
    highp float c = 43758.5453;
    highp float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}

/*
 * Pseudo-noise generator
 *
 * Credits:
 * https://thebookofshaders.com/11/
 */
highp float noise1d(float value) {
    highp float i = floor(value);
    highp float f = fract(value);
    return mix(random1d(i), random1d(i + 1.0), smoothstep(0.0, 1.0, f));
}

/*
 * Random number generator with a vec2 seed
 *
 * Credits:
 * http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0
 * https://github.com/mattdesl/glsl-random
 */
highp float random2d(vec2 co) {
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt = dot(co.xy, vec2(a, b));
    highp float sn = mod(dt, 3.14);
    return fract(sin(sn) * c);
}

void main() {
    vec4 texA = texture2D(uTextureA, vUv);
    vec4 texB = texture2D(uTextureB, vUv);

    // The visible face is in the XY plane
    vec2 pos2D = vPosition.xy;

    // Manually set the center point - adjust these values to shift the origin
    // Increase X to move center right, decrease to move left
    // Increase Y to move center up, decrease to move down
    vec2 center = vec2(-0.075, 0.25); // Start with this, adjust as needed

    // Center the coordinates around the manual center
    vec2 centeredPos = pos2D - center;

    // Maximum radius to reach corners - adjust this if transition doesn't cover full screen
    float maxRadius = 0.335; // Increase if transition stops before edges

    // Calculate expanding radius based on transition progress
    float currentRadius = uTransitionProgress * maxRadius;

    // Use circle SDF
    float sdf = sdCircle(centeredPos, currentRadius);

    // Smooth reveal at the circle edge
    float reveal = smoothstep(0.0, -0.1, sdf);

    // Add noise to first scene texture
    float strength = (0.3 + 0.7 * noise1d(0.3 * uTime)) * 200. / uResolution.x;
    texA.rgb += vec3(5.0 * strength * (random2d(vUv + 1.133001 * vec2(uTime, 1.13)) - 0.5));

    vec4 finalColor = mix(texA, texB, reveal);
    gl_FragColor = finalColor;
}
