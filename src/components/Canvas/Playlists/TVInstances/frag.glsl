#define PI 3.14

uniform sampler2DArray textureArray;

in vec2 vUv;
flat in int vInstanceIndex;

out vec4 fragColor;

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
    vec4 imageTexture = texture(textureArray, vec3(uv, float(vInstanceIndex)));
    fragColor = imageTexture;
}
