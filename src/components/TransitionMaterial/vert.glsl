uniform float uTime;
uniform float blend; // transition progress 0-1

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

    // Distance from center for ripple calculation
    float distFromCenter = length(centeredPos);

    // Create expanding ripples during transition
    float rippleSpeed = 8.0; // How fast ripples move outward
    float rippleFrequency = 15.0; // Number of ripples
    float rippleAmplitude = 0.2; // Height of ripples

    // Calculate ripple based on distance and time
    // Multiple sine waves create interference pattern
    float ripple1 = sin(distFromCenter * rippleFrequency - uTime * rippleSpeed);
    float ripple2 = sin(distFromCenter * rippleFrequency * 1.5 - uTime * rippleSpeed * 0.8);
    float ripple3 = sin(distFromCenter * rippleFrequency * 0.7 - uTime * rippleSpeed * 1.2);

    // Combine ripples with different amplitudes for more natural look
    float combinedRipple = (ripple1 * 0.5 + ripple2 * 0.3 + ripple3 * 0.2);

    // Fade ripples based on distance (stronger near center)
    float distanceFade = exp(-distFromCenter * 2.0);

    // Only show ripples during transition (blend 0-1)
    // Fade in at start, fade out at end
    float transitionFade = sin(blend * 3.14159); // peaks at 0.5, fades at 0 and 1

    // Calculate final ripple displacement
    float rippleHeight = combinedRipple * rippleAmplitude * distanceFade * transitionFade;

    // Apply ripple to Z position
    vec3 p = vec3(position.x, position.y, position.z + max(rippleHeight, 0.0));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
