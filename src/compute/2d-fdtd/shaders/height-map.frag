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
  


  if(sourcemapValue.b > 0.0){
    float pos = heightmapValue.r;
    float vel = heightmapValue.g;
    
    
    
    vec2 ud_offset = vec2( 0.0, cellSize.y );
    vec2 rl_offset = vec2( cellSize.x, 0.0 );
    
    vec4 u = texture2D( heightmap, uv + ud_offset );    
    vec4 d = texture2D( heightmap, uv - ud_offset );
    vec4 r = texture2D( heightmap, uv + rl_offset );
    vec4 l = texture2D( heightmap, uv - rl_offset );
    
    float u_wall = texture2D( sourcemap, uv + ud_offset ).b;
    float d_wall = texture2D( sourcemap, uv - ud_offset ).b;
    float r_wall = texture2D( sourcemap, uv + rl_offset ).b;
    float l_wall = texture2D( sourcemap, uv - rl_offset ).b;
    
    
    // float u_pos = u_wall == 0 ? d.r : u.r;
    // float d_pos = d_wall == 0 ? u.r : d.r;
    // float r_pos = r_wall == 0 ? l.r : r.r;
    // float l_pos = l_wall == 0 ? r.r : l.r;

    float u_pos =  u.r;
    float d_pos =  d.r;
    float r_pos =  r.r;
    float l_pos =  l.r;
    
    if(u_wall == 0.0){
      u_pos = texture2D( heightmap, uv - ud_offset ).r;
    }
    if(d_wall == 0.0){
      d_pos = texture2D( heightmap, uv + ud_offset ).r;
    }
    if(r_wall == 0.0){
      r_pos = texture2D( heightmap, uv - rl_offset ).r;
    }
    if(l_wall == 0.0){
      l_pos = texture2D( heightmap, uv + rl_offset ).r;
    }

    float mid = 0.25*(u_pos+d_pos+r_pos+l_pos);
  
    float med = heightmapValue.b * 1.5;
    newvel = med*(mid-pos)+vel*damping;
    newpos = pos+newvel;
    
    if(sourcemapValue.a == 0.0){  
      newvel = sourcemapValue.g;
      newpos = sourcemapValue.r;
    }    
  }
  else {
    newvel = 0.0;
    newpos = 127.5;
  }
  
  
  gl_FragColor = vec4(newpos, newvel, heightmapValue.b, sourcemapValue.b);


}
