uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

float sdCircle(vec2 p, float r)
{
    return length(p) - r;
}

void main() {
    vUv = uv;
    vPosition = position;

    vec2 center = vec2(-0.075, 0.25);
    vec2 centeredPos = position.xy - center;

    float maxRadius = 0.375;
    float currentRadius = uTime * maxRadius;

    float sdf = sdCircle(centeredPos, currentRadius);
    float reveal = smoothstep(-0.075, -0.08, sdf);

    float maxHeight = 2.75;
    float newZ = position.z + sin(maxHeight * uTime);

    vec3 p = mix(position, vec3(position.x, position.y, newZ), reveal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
