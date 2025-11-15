#define PI 3.14

uniform sampler2DArray uTextureArray;
uniform float uTime;
uniform vec2 uResolution;

in vec2 vUv;
flat in int vInstanceIndex;

out vec4 fragColor;

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

vec2 rotateUV(vec2 uv, float rotation)
{
    float cosAngle = cos(rotation);
    float sinAngle = sin(rotation);
    vec2 p = uv - vec2(0.5);
    return vec2(
        cosAngle * p.x + sinAngle * p.y + 0.5,
        cosAngle * p.y - sinAngle * p.x + 0.5
    );
}

void main() {
    vec2 uv = rotateUV(vUv, PI / 2.);
    uv *= 1.9;
    uv.y -= 0.1;
    vec4 imageTexture = texture(uTextureArray, vec3(uv, float(vInstanceIndex)));

    float strength = (0.3 + 0.7 * noise1d(0.3 * uTime)) * 200. / uResolution.x;
    imageTexture.rgb += vec3(5.0 * strength * (random2d(uv + 1.133001 * vec2(uTime, 1.13)) - 0.5));

    fragColor = imageTexture;
}
