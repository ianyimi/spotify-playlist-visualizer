out vec2 vUv;
flat out int vInstanceIndex;

void main() {
    vUv = uv;
    vInstanceIndex = gl_InstanceID;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
