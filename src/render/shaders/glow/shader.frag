uniform vec3 glowColor;
uniform vec3 normalColor;
varying float intensity;
uniform float t;
uniform float freq;
#define pi 3.141592653589793
void main() 
{
    
	vec3 col = normalColor + 0.5 * (sin(2.0*pi*freq*t)+1.0) * (glowColor - normalColor);
    gl_FragColor = vec4( col, 1.0);
}
