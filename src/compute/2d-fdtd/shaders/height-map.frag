#include <common>

uniform vec2 mousePos;
uniform float mouseSize;
uniform float damping;
uniform float heightCompensation;
uniform sampler2D sourcemap;

void main()	{

  vec2 cellSize = 1.0 / resolution.xy;

  vec2 uv = gl_FragCoord.xy * cellSize;
    
  float newvel = 0.;
  float newpos = 0.;


  vec4 heightmapValue = texture2D( heightmap, uv );
  vec4 sourcemapValue = texture2D( sourcemap, uv);

  if(heightmapValue.b > 0.0){
    float pos = heightmapValue.r;
    float vel = heightmapValue.g;
    vec4 up = texture2D( heightmap, uv + vec2( 0.0, cellSize.y ) );
    vec4 down = texture2D( heightmap, uv + vec2( 0.0, - cellSize.y ) );
    vec4 right = texture2D( heightmap, uv + vec2( cellSize.x, 0.0 ) );
    vec4 left = texture2D( heightmap, uv + vec2( - cellSize.x, 0.0 ) );

    float mid = 0.25*(up.r+down.r+right.r+left.r);
  
    float med = heightmapValue.b * 1.5;
    newvel = med*(mid-pos)+vel*damping;
    newpos = pos+newvel;
    
    newvel *= sourcemapValue.a;
    newvel += sourcemapValue.g;
    
    newpos *= sourcemapValue.a;
    newpos += sourcemapValue.r;
    
  }
  
  
  gl_FragColor = vec4(newpos, newvel, heightmapValue.b, 1.);


}
