uniform sampler2D a;
uniform sampler2D b;
uniform float blend;
uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

mediump float;

#include <packing>

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
    vec4 texA = texture2D(a, vUv);
    vec4 texB = texture2D(b, vUv);

    // For fullscreen quad, use UV coordinates (0-1 range)
    // Center the UVs around 0.5, 0.5 (the screen center)
    vec2 centeredUv = vUv - 0.5;

    // Maximum radius to reach corners from center
    float maxRadius = length(vec2(0.5, 0.5)); // sqrt(0.5^2 + 0.5^2) = 0.707

    // Calculate expanding radius based on transition progress
    float currentRadius = blend * maxRadius;

    // Use circle SDF
    float sdf = sdCircle(centeredUv, currentRadius);

    // Smooth reveal at the circle edge
    float reveal = smoothstep(0., -0.1, sdf);

    // Add noise to first scene texture
    // float strength = (0.3 + 0.7 * noise1d(0.3 * uTime)) * 200. / uResolution.x;
    // texA.rgb += vec3(5.0 * strength * (random2d(centeredUv + 1.133001 * vec2(uTime, 1.13)) - 0.5));

    vec4 finalColor = mix(texB, texA, reveal);
    gl_FragColor = finalColor;
    // #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
