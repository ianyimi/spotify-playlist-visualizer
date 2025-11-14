uniform sampler2D textureA;
uniform sampler2D textureB;
uniform float transitionProgress;

varying vec2 vUv;

mediump float;

void main() {
    vec4 texA = texture2D(textureA, vUv);
    vec4 texB = texture2D(textureB, vUv);

    vec4 finalColor = mix(texA, texB, transitionProgress);
    gl_FragColor = finalColor;
}
