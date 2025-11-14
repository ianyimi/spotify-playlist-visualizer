uniform sampler2DArray textureArray;

in vec2 vUv;
flat in int vInstanceIndex;

out vec4 fragColor;

void main() {
    vec4 imageTexture = texture(textureArray, vec3(vUv, float(vInstanceIndex)));
    fragColor = imageTexture;
}
